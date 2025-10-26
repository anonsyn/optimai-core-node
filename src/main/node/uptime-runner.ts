import EventEmitter from 'eventemitter3'
import log from '../configs/logger'

import { DeviceType } from '../api/device/types'
import { uptimeApi } from '../api/uptime'
import { eventsService } from '../services/events-service'
import type { UptimeData } from '../storage'
import { deviceStore, rewardStore, uptimeStore, userStore } from '../storage'
import { decode, encode } from '../utils/encoder'
import { getErrorMessage } from '../utils/get-error-message'

interface UptimeRunnerEvents {
  reward: (reward: { amount: string; timestamp: number }) => void
  cycle: (cycle: UptimeData) => void
  error: (error: Error) => void
}

export class UptimeRunner extends EventEmitter<UptimeRunnerEvents> {
  private running = false
  private timer: NodeJS.Timeout | null = null
  private readonly intervalMs = 10000

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString()
  }

  start() {
    if (this.running) {
      log.warn('[uptime] Uptime runner already running')
      return
    }

    log.info('[uptime] Starting uptime runner...')
    const cycle = uptimeStore.getData()

    this.emit('cycle', cycle)

    this.running = true

    log.info('[uptime] Uptime runner started - first check scheduled immediately')

    this.timer = setTimeout(() => {
      void this.tick()
    }, this.intervalMs)
  }

  stop() {
    log.info('[uptime] Stopping uptime runner...')

    // Log current state before stopping
    try {
      const cycle = uptimeStore.getCurrentCycle()
      if (cycle) {
        const cycleDuration = cycle.refresh_at - cycle.created_at
        const progress = Math.min(100, Math.floor((cycle.uptime / cycleDuration) * 100))
        const remainingMs = cycle.refresh_at - Date.now()

        log.info(`[uptime] Current cycle at stop:`)
        log.info(
          `[uptime] - Progress: ${this.formatTime(cycle.uptime)} / ${this.formatTime(cycleDuration)} (${progress}%)`
        )
        if (remainingMs > 0) {
          log.info(`[uptime] - Would have reported in: ${this.formatTime(remainingMs)}`)
        } else {
          log.info(`[uptime] - Cycle was ready for report`)
        }
      }
    } catch (error) {
      log.debug('[uptime] Could not log current cycle state:', error)
    }

    this.running = false

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    log.info('[uptime] Uptime runner stopped')
  }

  private async tick() {
    if (!this.running) {
      log.debug('[uptime] Tick skipped - not running')
      return
    }

    if (this.timer) {
      clearTimeout(this.timer)
    }

    try {
      const data = uptimeStore.getCurrentCycle()

      if (!data) {
        log.info('[uptime] No active cycle found - creating new cycle')
        const cycle = uptimeStore.createCycle()
        log.info(
          `[uptime] New cycle created - will report at: ${this.formatTimestamp(cycle.refresh_at)}`
        )
        this.emit('cycle', cycle)
      } else {
        uptimeStore.increaseUptime(this.intervalMs)
        log.info(`[uptime] Uptime increased by ${this.formatTime(this.intervalMs)}`)

        if (uptimeStore.isExpired()) {
          log.info(`[uptime] Cycle completed - reporting to server`)
          await this.reportCycle(data)
          const cycle = uptimeStore.createCycle()
          log.info(
            `[uptime] New cycle created - will report at: ${this.formatTimestamp(cycle.refresh_at)}`
          )
        }

        const newUptimeData = uptimeStore.getData()

        this.emit('cycle', newUptimeData)
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Uptime tick error')
      log.error('[uptime] ✗ Error in tick:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    } finally {
      if (this.running) {
        const nextCheckTime = Date.now() + this.intervalMs
        log.debug(
          `[uptime] Next check scheduled at: ${this.formatTimestamp(nextCheckTime)} (in ${this.formatTime(this.intervalMs)})`
        )
        this.timer = setTimeout(() => {
          void this.tick()
        }, this.intervalMs)
      }
    }
  }

  private async reportCycle(data: UptimeData) {
    const user = userStore.getUser()
    if (!user) {
      log.error('[uptime] ✗ Cannot report cycle - user information not available')
      return
    }

    const deviceId = deviceStore.getDeviceId()
    const maxDuration = data.refresh_at - data.created_at
    const duration = Math.min(data.uptime, maxDuration)

    if (duration <= 1000) {
      log.warn(
        `[uptime] ✗ Cycle duration too short (${this.formatTime(duration)}) - skipping report and creating new cycle`
      )
      return
    }

    const payload = {
      duration,
      user_id: user.id,
      device_id: deviceId,
      device_type: DeviceType.PC,
      timestamp: Date.now()
    }

    log.info(`[uptime] Sending report to API...`)
    const encoded = encode(JSON.stringify(payload))
    let response: Awaited<ReturnType<typeof uptimeApi.reportOnline>>
    try {
      response = await uptimeApi.reportOnline(encoded)
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to report uptime')
      log.error('[uptime] ✗ Failed to report cycle:', errorMessage)
      await eventsService.reportError({
        type: 'uptime.report_failed',
        message: 'Failed to report uptime to server',
        error,
        metadata: {
          duration,
          maxDuration,
          payloadSize: encoded.length
        }
      })
      return
    }

    try {
      const decoded = decode(response.data.data)
      const parsed = JSON.parse(decoded) as {
        reward?: string | number
        timestamp?: number
      }

      if (parsed.reward !== undefined) {
        const amount = typeof parsed.reward === 'number' ? parsed.reward.toString() : parsed.reward
        const timestamp = parsed.timestamp ?? Date.now()
        log.info(`[uptime] ✓✓✓ Reward received: ${amount} tokens ✓✓✓`)
        log.info(`[uptime] Reward timestamp: ${this.formatTimestamp(timestamp)}`)
        rewardStore.saveReward(amount, timestamp)
        this.emit('reward', { amount, timestamp })
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Failed to parse reward response')
      log.error('[uptime] ✗ Error parsing reward response:', errorMsg)
      await eventsService.reportError({
        type: 'uptime.reward_parse_failed',
        message: 'Failed to parse uptime reward response',
        error,
        metadata: {
          duration,
          maxDuration,
          payloadSize: encoded.length,
          responsePreview:
            typeof response?.data?.data === 'string' ? response.data.data.slice(0, 200) : undefined
        }
      })
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    }
  }
}
