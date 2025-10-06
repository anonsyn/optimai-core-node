import log from 'electron-log/main'
import EventEmitter from 'eventemitter3'
import lodash from 'lodash'
import type PQueue from 'p-queue'
import { miningApi } from '../api/mining'
import type { SubmitAssignmentRequest } from '../api/mining/types'
import { MiningAssignmentFailureReason } from '../api/mining/types'
import { crawl4AiService } from '../services/crawl4ai-service'
import { crawlerService } from '../services/crawler-service'
import { dockerService } from '../services/docker-service'
import { deviceStore, tokenStore, userStore } from '../storage'
import { encode } from '../utils/encoder'
import { getErrorMessage } from '../utils/get-error-message'
import { MiningStatus, type MiningAssignment, type MiningWorkerStatus } from './types'

// Re-export for backward compatibility
export { MiningStatus, type MiningWorkerStatus }

interface MiningWorkerEvents {
  assignments: (assignments: MiningAssignment[]) => void
  assignmentStarted: (assignmentId: string) => void
  assignmentCompleted: (assignmentId: string) => void
  assignmentFailed: (assignmentId: string, error: Error) => void
  error: (error: Error) => void
  statusChanged: (status: MiningWorkerStatus) => void
}

const DOCKER_CHECK_INTERVAL_MS = 15_000
const HEARTBEAT_INTERVAL_MS = 30_000
const POLL_INTERVAL_MS = 30_000
const SSE_RETRY_BASE_MS = 2_000
const SSE_RETRY_MAX_MS = 10_000

export class MiningWorker extends EventEmitter<MiningWorkerEvents> {
  private running = false
  private pollTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private dockerMonitorTimer: NodeJS.Timeout | null = null
  private sseAbortController: AbortController | null = null
  private processing = false
  private processingAssignments = new Set<string>()
  private sseBackoff = SSE_RETRY_BASE_MS
  private dockerAvailable = false
  private crawlerServiceInitialized = false
  private assignmentQueue: PQueue | null = null
  private status: MiningStatus = MiningStatus.Idle
  private lastError?: string

  private setStatus(status: MiningStatus, error?: string) {
    const prevStatus = this.status
    this.status = status
    this.lastError = error
    const fullStatus = this.getStatus()

    // Always log status changes for debugging
    log.info(`[mining] Status update: ${prevStatus} → ${status}`, fullStatus)

    // Always emit the status, even if it hasn't changed
    // This ensures the UI gets updated
    this.emit('statusChanged', fullStatus)
  }

  getStatus(): MiningWorkerStatus {
    return {
      status: this.status,
      dockerAvailable: this.dockerAvailable,
      crawlerInitialized: this.crawlerServiceInitialized,
      isProcessing: this.processingAssignments.size > 0,
      assignmentCount: this.processingAssignments.size,
      lastError: this.lastError
    }
  }

  async start() {
    if (this.running) {
      return
    }

    log.info('[mining] Starting mining worker...')
    this.running = true
    this.sseBackoff = SSE_RETRY_BASE_MS
    this.setStatus(MiningStatus.Initializing)

    // Check Docker availability
    this.dockerAvailable = await this.checkDockerAvailability()
    if (!this.dockerAvailable) {
      log.error('[mining] Docker is not available - cannot start mining')
      log.error('[mining] Please install and start Docker from https://docker.com to enable mining')
      this.setStatus(MiningStatus.Error, 'Docker not available')
      this.running = false
      return
    }

    // Initialize crawler service
    this.setStatus(MiningStatus.InitializingCrawler)
    try {
      const initialized = await crawlerService.initialize()
      if (initialized) {
        this.crawlerServiceInitialized = true
        this.setStatus(MiningStatus.Ready)
        log.info('[mining] Crawler service initialized successfully')
        this.startDockerMonitor()
      } else {
        log.error('[mining] Crawler initialization failed')
        this.setStatus(MiningStatus.Error, 'Crawler initialization failed')
        this.running = false
        return
      }
    } catch (error) {
      log.error(
        '[mining] Failed to initialize crawler service:',
        getErrorMessage(error, 'Failed to initialize crawler service')
      )
      this.dockerAvailable = false
      this.setStatus(MiningStatus.Error, 'Crawler initialization failed')
      this.running = false
      return
    }

    // Set worker preferences
    await this.setWorkerPreferences()

    // Start services
    this.startHeartbeat()
    this.connectSse()
    this.schedulePoll(0)
  }

  async stop() {
    log.info('[mining] Stopping mining worker...')
    this.running = false
    this.processing = false
    this.processingAssignments.clear()

    this.clearTimer(this.pollTimer)
    this.pollTimer = null

    this.clearTimer(this.heartbeatTimer)
    this.heartbeatTimer = null

    this.clearTimer(this.reconnectTimer)
    this.reconnectTimer = null

    this.clearTimer(this.dockerMonitorTimer)
    this.dockerMonitorTimer = null

    if (this.sseAbortController) {
      this.sseAbortController.abort()
      this.sseAbortController = null
    }

    // Close crawler service
    if (this.crawlerServiceInitialized) {
      await crawlerService.close()
      this.crawlerServiceInitialized = false
    }

    if (this.assignmentQueue) {
      this.assignmentQueue.clear()
      this.assignmentQueue = null
    }
  }

  private async checkDockerAvailability(): Promise<boolean> {
    try {
      const installed = await dockerService.isInstalled()
      if (!installed) {
        return false
      }

      const running = await dockerService.isRunning()
      return running
    } catch (error) {
      log.error(
        '[mining] Error checking Docker availability:',
        getErrorMessage(error, 'Error checking Docker availability')
      )
      return false
    }
  }

  private async setWorkerPreferences() {
    try {
      // Set preferences to receive both platforms
      // But we'll only process Google tasks
      await miningApi.setWorkerPreferences(['google'])
      log.info(
        '[mining] Worker preferences set to receive all platforms (will process Google only)'
      )
    } catch (error) {
      log.error(
        '[mining] Failed to set worker preferences:',
        getErrorMessage(error, 'Failed to set worker preferences')
      )
    }
  }

  private startHeartbeat() {
    const sendHeartbeat = async () => {
      const user = userStore.getUser()
      const deviceId = deviceStore.getDeviceId()

      if (!user || !deviceId) {
        log.warn('[mining] Skipping heartbeat - missing user or device ID')
        return
      }

      const agentInfo = {
        client: 'desktop-core-node',
        ts: Date.now(),
        docker_available: this.dockerAvailable
      }

      const payload = {
        user_id: user.id,
        device_id: deviceId,
        agent_info: agentInfo
      }

      const encodedPayload = encode(JSON.stringify(payload))

      try {
        const response = await miningApi.sendHeartbeat({ data: encodedPayload })
        log.debug('[mining] Heartbeat sent')

        // Handle assignment count in response
        if (response.data?.assigned && response.data.assigned > 0) {
          log.info(`[mining] Heartbeat assigned ${response.data.assigned} new tasks`)
          // Trigger assignment processing
          void this.processAssignments()
        }
      } catch (error) {
        log.error('[mining] Heartbeat failed:', getErrorMessage(error, 'Heartbeat failed'))
        this.emit('error', error instanceof Error ? error : new Error(String(error)))
      }
    }

    void sendHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      void sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)
  }

  private connectSse() {
    if (!this.running) {
      return
    }

    if (this.sseAbortController) {
      this.sseAbortController.abort()
    }

    const controller = new AbortController()
    this.sseAbortController = controller

    const attemptConnection = async () => {
      const token = tokenStore.getAccessToken()
      const eventsUrl = miningApi.getEventsUrl()

      if (!token || !eventsUrl) {
        log.warn('[mining] Skipping SSE connection - missing token or events URL')
        this.scheduleReconnect()
        return
      }

      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
        'X-Service': 'miner'
      }

      try {
        const response = await fetch(eventsUrl, {
          method: 'GET',
          headers,
          signal: controller.signal
        })

        if (!response.ok || !response.body) {
          throw new Error(`SSE connection failed with status ${response.status}`)
        }

        log.info('[mining] Connected to miner SSE stream')
        this.sseBackoff = SSE_RETRY_BASE_MS

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (this.running && !controller.signal.aborted) {
          const { value, done } = await reader.read()
          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })

          let boundary = buffer.indexOf('\n\n')
          while (boundary !== -1) {
            const rawEvent = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            this.handleSseEvent(rawEvent)
            boundary = buffer.indexOf('\n\n')
          }
        }

        log.warn('[mining] SSE connection closed')
      } catch (error) {
        if (!controller.signal.aborted) {
          log.error('[mining] SSE error:', getErrorMessage(error, 'SSE error'))
          this.emit('error', error instanceof Error ? error : new Error(String(error)))
        }
      } finally {
        if (this.running && !controller.signal.aborted) {
          this.scheduleReconnect()
        }
      }
    }

    void attemptConnection()
  }

  private handleSseEvent(raw: string) {
    if (!this.running) {
      return
    }

    let eventType = 'message'
    let eventData = ''

    for (const line of raw.split('\n')) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        eventData += `${line.slice(5).trim()}\n`
      }
    }

    eventData = eventData.trim()

    // Handle assignment events
    if (eventType === 'assignment') {
      try {
        const data = JSON.parse(eventData)
        log.info(
          `[mining] Assignment event received: ${data.count} tasks, query: ${data.search_query_id}`
        )
        // Trigger assignment processing
        void this.processAssignments()
      } catch (error) {
        log.error(
          '[mining] Failed to parse assignment event data:',
          getErrorMessage(error, 'Failed to parse assignment event data')
        )
        // Still try to process assignments even if parsing fails
        void this.processAssignments()
      }
    } else if (eventType === 'message') {
      // Handle generic message events if needed
      log.debug(`[mining] SSE message event: ${eventData.substring(0, 100)}`)
      void this.processAssignments()
    }
    // Ignore keep-alive messages (they don't have an event type)
  }

  private scheduleReconnect() {
    this.clearTimer(this.reconnectTimer)
    const delay = this.sseBackoff
    this.sseBackoff = Math.min(this.sseBackoff * 2, SSE_RETRY_MAX_MS)

    this.reconnectTimer = setTimeout(() => {
      this.connectSse()
    }, delay)
  }

  private schedulePoll(delay: number) {
    this.clearTimer(this.pollTimer)
    this.pollTimer = setTimeout(() => {
      void this.processAssignments()
      this.schedulePoll(POLL_INTERVAL_MS)
    }, delay)
  }

  private clearTimer(timer: NodeJS.Timeout | null) {
    if (timer) {
      clearTimeout(timer)
    }
  }

  private startDockerMonitor() {
    this.clearTimer(this.dockerMonitorTimer)

    let checking = false
    const checkDockerState = async () => {
      if (checking) {
        return
      }
      checking = true

      if (!this.running) {
        checking = false
        return
      }
      try {
        const dockerAvailable = await this.checkDockerAvailability()
        let containerRunning = true

        if (dockerAvailable && this.crawlerServiceInitialized) {
          containerRunning = await crawl4AiService.isContainerRunning()
        }

        const environmentHealthy = dockerAvailable && containerRunning
        this.dockerAvailable = environmentHealthy

        if (!environmentHealthy) {
          const reason = !dockerAvailable ? 'Docker not available' : 'Crawler container stopped'
          const containerInfo = !dockerAvailable ? '' : ` (${crawl4AiService.getContainerName()})`
          log.warn(`[mining] ${reason}${containerInfo} - stopping mining worker`)
          this.setStatus(MiningStatus.Error, reason)
          await this.stop()
        }
      } finally {
        checking = false
      }
    }

    void checkDockerState()
    this.dockerMonitorTimer = setInterval(() => {
      void checkDockerState()
    }, DOCKER_CHECK_INTERVAL_MS)
  }

  private async processAssignments() {
    if (!this.running || this.processing) {
      return
    }

    this.processing = true

    try {
      // Fetch assignments
      const { data } = await miningApi.getAssignments({
        statuses: ['not_started', 'in_progress'],
        limit: 30,
        platforms: 'google' // Only fetch Google platform tasks
      })

      const assignments = data?.assignments ?? []

      // Filter for Google platform (server filtering might not work)
      const googleAssignments = assignments.filter(
        (a) => a.task?.platform === 'google' || !a.task?.platform
      )

      log.info(`[mining] Fetched ${googleAssignments.length} Google assignments`)

      // Emit assignments event for UI consumers
      this.emit('assignments', googleAssignments)

      // Process each assignment
      const queue = await this.getAssignmentQueue()

      for (const assignment of googleAssignments) {
        if (!this.running) {
          break
        }

        // Skip if already processing
        if (this.processingAssignments.has(assignment.id)) {
          continue
        }

        if (this.dockerAvailable && this.crawlerServiceInitialized) {
          this.processingAssignments.add(assignment.id)
          this.setStatus(MiningStatus.Processing)
          queue
            .add(() => this.processAssignment(assignment))
            .catch((error) => {
              log.error(
                `[mining] Queue task for assignment ${assignment.id} failed:`,
                getErrorMessage(error, `Failed to process assignment ${assignment.id}`)
              )
              this.processingAssignments.delete(assignment.id)
              if (this.processingAssignments.size === 0) {
                this.setStatus(MiningStatus.Ready)
              }
            })
        } else {
          log.warn(
            `[mining] Cannot process assignment ${assignment.id} - Docker/crawler not available`
          )
        }
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Error fetching assignments')
      log.error('[mining] Error fetching assignments:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.processing = false
    }
  }

  private async processAssignment(assignment: MiningAssignment) {
    const { id: assignmentId, status, task } = assignment

    try {
      // Start assignment if needed
      if (status === 'not_started') {
        try {
          log.info(`[mining] Starting assignment ${assignmentId}`)
          await miningApi.startAssignment(assignmentId)
          this.emit('assignmentStarted', assignmentId)
        } catch (error: any) {
          // Check if already started (409 status)
          if (error?.response?.status !== 409) {
            throw error
          }
          log.info(`[mining] Assignment ${assignmentId} already started`)
        }
      }

      // Get URL from task
      const url = task?.source_url || (task as any)?.url
      if (!url) {
        throw new Error(`No URL found for assignment ${assignmentId}`)
      }

      const title = (task as any)?.title || `Assignment ${assignmentId}`

      // Crawl content
      log.info(`[mining] Crawling content from ${url} for assignment ${assignmentId}`)
      const startTime = Date.now()

      const crawlResult = await crawlerService.crawl({
        url
      })

      if (!crawlResult || !crawlResult.markdown) {
        throw new Error(`No content crawled for assignment ${assignmentId}`)
      }

      const crawlTime = (Date.now() - startTime) / 1000
      log.info(
        `[mining] Successfully crawled ${crawlResult.markdown.length} chars in ${crawlTime}s for assignment ${assignmentId}`
      )

      // Prepare metadata
      const metadata: Record<string, any> = {
        platform: 'google',
        url,
        timestamp: new Date().toISOString(),
        ...crawlResult.metadata,
        title: lodash.get(crawlResult, 'metadata.title', title)
      }

      // Submit assignment
      log.info(
        `[mining] Submitting assignment ${assignmentId} with ${crawlResult.markdown.length} chars`
      )
      const submitRequest: SubmitAssignmentRequest = {
        content: crawlResult.markdown,
        metadata
      }

      await miningApi.submitAssignment(assignmentId, submitRequest)

      log.info(`[mining] ✓ Assignment ${assignmentId} submitted successfully`)
      this.emit('assignmentCompleted', assignmentId)
    } catch (error) {
      const errorMsg = getErrorMessage(error, `Failed to process assignment ${assignmentId}`)
      log.error(`[mining] Failed to process assignment ${assignmentId}:`, errorMsg)

      this.emit(
        'assignmentFailed',
        assignmentId,
        error instanceof Error ? error : new Error(String(error))
      )

      // Check if already completed (409 status)
      if ((error as any)?.response?.status === 409) {
        log.info(`[mining] Assignment ${assignmentId} already completed`)
        this.emit('assignmentCompleted', assignmentId)
      } else {
        // Determine abandon reason based on error
        const reason = this.getAbandonReason(errorMsg)

        // Abandon the assignment
        try {
          await miningApi.abandonAssignment(assignmentId, {
            reason,
            details: errorMsg.substring(0, 200)
          })
          log.info(`[mining] Assignment ${assignmentId} abandoned with reason: ${reason}`)
        } catch (abandonError) {
          log.error(
            `[mining] Failed to abandon assignment ${assignmentId}:`,
            getErrorMessage(abandonError, 'Failed to abandon assignment')
          )
        }
      }
    } finally {
      // Remove from processing set
      this.processingAssignments.delete(assignmentId)
      if (this.processingAssignments.size === 0) {
        this.setStatus(
          this.dockerAvailable && this.crawlerServiceInitialized
            ? MiningStatus.Ready
            : MiningStatus.Error
        )
      }
    }
  }

  private async getAssignmentQueue(): Promise<PQueue> {
    if (this.assignmentQueue) {
      return this.assignmentQueue
    }

    const { default: PQueueCtor } = await import('p-queue')
    this.assignmentQueue = new PQueueCtor({ concurrency: 1 })
    return this.assignmentQueue
  }

  private getAbandonReason(errorMsg: string): MiningAssignmentFailureReason {
    const msg = errorMsg.toLowerCase()

    // Check for specific error patterns
    if (
      msg.includes('404') ||
      msg.includes('not found') ||
      msg.includes('no url') ||
      msg.includes('invalid url')
    ) {
      return MiningAssignmentFailureReason.LINK_INVALID
    }

    if (
      msg.includes('403') ||
      msg.includes('forbidden') ||
      msg.includes('blocked') ||
      msg.includes('access denied')
    ) {
      return MiningAssignmentFailureReason.SITE_BLOCKED
    }

    if (
      msg.includes('500') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504') ||
      msg.includes('timeout') ||
      msg.includes('timed out') ||
      msg.includes('unreachable')
    ) {
      return MiningAssignmentFailureReason.SITE_DOWN
    }

    if (msg.includes('removed') || msg.includes('deleted') || msg.includes('no content')) {
      return MiningAssignmentFailureReason.CONTENT_REMOVED
    }

    // Default to site_blocked for other errors
    return MiningAssignmentFailureReason.SITE_BLOCKED
  }
}
