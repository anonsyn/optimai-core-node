import log from 'electron-log/main'
import EventEmitter from 'eventemitter3'

import { DeviceType } from '../api/device/types'
import { uptimeApi } from '../api/uptime'
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
  private inFlight = false
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
    const cycleDuration = cycle.refresh_at - cycle.created_at
    const progress = Math.min(100, Math.floor((cycle.uptime / cycleDuration) * 100))
    const remainingMs = cycle.refresh_at - Date.now()

    log.info(
      `[uptime] Current cycle progress: ${this.formatTime(cycle.uptime)} / ${this.formatTime(cycleDuration)} (${progress}%)`
    )
    log.info(`[uptime] Cycle started at: ${this.formatTimestamp(cycle.created_at)}`)

    if (remainingMs > 0) {
      log.info(
        `[uptime] Expected next report time: ${this.formatTimestamp(cycle.refresh_at)} (in ${this.formatTime(remainingMs)})`
      )
    } else {
      log.info(
        `[uptime] Cycle ready for report (overdue by ${this.formatTime(Math.abs(remainingMs))})`
      )
    }

    log.info(`[uptime] Check interval: ${this.formatTime(this.intervalMs)}`)

    this.emit('cycle', cycle)

    this.running = true
    this.schedule(0)
    log.info('[uptime] Uptime runner started - first check scheduled immediately')
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

    this.inFlight = false
    log.info('[uptime] Uptime runner stopped')
  }

  private schedule(delay: number) {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      void this.tick()
    }, delay)
  }

  private async tick() {
    if (!this.running) {
      log.debug('[uptime] Tick skipped - not running')
      return
    }

    if (this.inFlight) {
      log.debug('[uptime] Tick skipped - already in flight')
      this.schedule(1000)
      return
    }

    this.inFlight = true
    const tickStartTime = Date.now()
    log.debug(`[uptime] ──────────────────────────────────────`)
    log.debug(`[uptime] Tick started at: ${this.formatTimestamp(tickStartTime)}`)

    try {
      const data = uptimeStore.getCurrentCycle()

      if (!data) {
        log.info('[uptime] No active cycle found - creating new cycle')
        const cycle = uptimeStore.createCycle()
        log.info(
          `[uptime] New cycle created - will report at: ${this.formatTimestamp(cycle.refresh_at)}`
        )
        log.info(`[uptime] Cycle duration: ${this.formatTime(cycle.refresh_at - cycle.created_at)}`)
        this.emit('cycle', cycle)
      } else if (Date.now() >= data.refresh_at) {
        log.info('[uptime] ✓ Cycle completed - reporting to server')
        const cycleDuration = data.refresh_at - data.created_at
        log.info(
          `[uptime] Final uptime tracked: ${this.formatTime(data.uptime)} / ${this.formatTime(cycleDuration)}`
        )
        await this.reportCycle(data)
      } else {
        const remainingMs = data.refresh_at - Date.now()
        const cycleDuration = data.refresh_at - data.created_at
        const progress = Math.min(100, Math.floor((data.uptime / cycleDuration) * 100))

        log.info(`[uptime] Increasing uptime by ${this.formatTime(this.intervalMs)}`)
        log.info(
          `[uptime] Current progress: ${this.formatTime(data.uptime)} / ${this.formatTime(cycleDuration)} (${progress}%)`
        )
        log.info(
          `[uptime] Time until report: ${this.formatTime(remainingMs)} (at ${this.formatTimestamp(data.refresh_at)})`
        )

        uptimeStore.increaseUptime(this.intervalMs)
        const updated = uptimeStore.getData()
        const newProgress = Math.min(100, Math.floor((updated.uptime / cycleDuration) * 100))
        log.info(
          `[uptime] New progress: ${this.formatTime(updated.uptime)} / ${this.formatTime(cycleDuration)} (${newProgress}%)`
        )

        this.emit('cycle', updated)
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Uptime tick error')
      log.error('[uptime] ✗ Error in tick:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.inFlight = false
      if (this.running) {
        const nextCheckTime = Date.now() + this.intervalMs
        log.debug(
          `[uptime] Next check scheduled at: ${this.formatTimestamp(nextCheckTime)} (in ${this.formatTime(this.intervalMs)})`
        )
        this.schedule(this.intervalMs)
      }
      log.debug(`[uptime] ──────────────────────────────────────`)
    }
  }

  private async reportCycle(data: UptimeData) {
    const user = userStore.getUser()
    if (!user) {
      log.error('[uptime] ✗ Cannot report cycle - user information not available')
      throw new Error('User information not available')
    }

    const deviceId = deviceStore.getDeviceId()
    const maxDuration = data.refresh_at - data.created_at
    const duration = Math.min(data.uptime, maxDuration)
    const efficiency = Math.floor((duration / maxDuration) * 100)

    log.info(`[uptime] ═══════════════════════════════════════`)
    log.info(`[uptime] Reporting cycle to server`)
    log.info(`[uptime] Device ID: ${deviceId}`)
    log.info(`[uptime] User ID: ${user.id}`)
    log.info(`[uptime] Cycle started: ${this.formatTimestamp(data.created_at)}`)
    log.info(`[uptime] Cycle ended: ${this.formatTimestamp(data.refresh_at)}`)
    log.info(`[uptime] Total duration: ${this.formatTime(maxDuration)}`)
    log.info(`[uptime] Uptime tracked: ${this.formatTime(duration)}`)
    log.info(`[uptime] Efficiency: ${efficiency}%`)

    if (duration <= 1000) {
      log.warn(
        `[uptime] ✗ Cycle duration too short (${this.formatTime(duration)}) - skipping report and creating new cycle`
      )
      const cycle = uptimeStore.createCycle()
      log.info(`[uptime] New cycle will report at: ${this.formatTimestamp(cycle.refresh_at)}`)
      this.emit('cycle', cycle)
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
    const reportStartTime = Date.now()
    const encoded = encode(JSON.stringify(payload))
    const response = await uptimeApi.reportOnline(encoded)
    const reportDuration = Date.now() - reportStartTime
    log.info(`[uptime] Report sent successfully (took ${reportDuration}ms)`)

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
      } else {
        log.info('[uptime] No reward in response (might be accumulated)')
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Failed to parse reward response')
      log.error('[uptime] ✗ Error parsing reward response:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    }

    log.info('[uptime] Creating new cycle...')
    const cycle = uptimeStore.createCycle()
    log.info(`[uptime] ✓ New cycle created`)
    log.info(
      `[uptime] Next report scheduled at: ${this.formatTimestamp(cycle.refresh_at)} (in ${this.formatTime(cycle.refresh_at - Date.now())})`
    )
    log.info(`[uptime] ═══════════════════════════════════════`)
    this.emit('cycle', cycle)
  }
}
