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
  private readonly intervalMs = 600000 // 10 minutes

  start() {
    if (this.running) {
      log.warn('[uptime] Uptime runner already running')
      return
    }

    log.info('[uptime] Starting uptime runner...')
    const cycle = uptimeStore.getData()
    log.debug(
      `[uptime] Current cycle: ${cycle.uptime}ms / ${cycle.refresh_at - cycle.created_at}ms`
    )
    this.emit('cycle', cycle)

    this.running = true
    this.schedule(0)
    log.info('[uptime] Uptime runner started')
  }

  stop() {
    log.info('[uptime] Stopping uptime runner...')
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

    try {
      const data = uptimeStore.getCurrentCycle()

      if (!data) {
        log.info('[uptime] No active cycle found - creating new cycle')
        const cycle = uptimeStore.createCycle()
        this.emit('cycle', cycle)
      } else if (Date.now() >= data.refresh_at) {
        log.info('[uptime] Cycle completed - reporting to server')
        await this.reportCycle(data)
      } else {
        const remainingMs = data.refresh_at - Date.now()
        log.debug(
          `[uptime] Increasing uptime by ${this.intervalMs}ms (${Math.floor(remainingMs / 1000)}s until report)`
        )
        uptimeStore.increaseUptime(this.intervalMs)
        const updated = uptimeStore.getData()
        this.emit('cycle', updated)
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Uptime tick error')
      log.error('[uptime] Error in tick:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    } finally {
      this.inFlight = false
      if (this.running) {
        this.schedule(this.intervalMs)
      }
    }
  }

  private async reportCycle(data: UptimeData) {
    const user = userStore.getUser()
    if (!user) {
      log.error('[uptime] Cannot report cycle - user information not available')
      throw new Error('User information not available')
    }

    const deviceId = deviceStore.getDeviceId()
    log.debug(`[uptime] Reporting cycle for device ${deviceId}`)

    const maxDuration = data.refresh_at - data.created_at
    const duration = Math.min(data.uptime, maxDuration)

    if (duration <= 1000) {
      log.warn(
        `[uptime] Cycle duration too short (${duration}ms) - skipping report and creating new cycle`
      )
      const cycle = uptimeStore.createCycle()
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

    log.info(`[uptime] Reporting ${Math.floor(duration / 1000)}s uptime for user ${user.id}`)
    const encoded = encode(JSON.stringify(payload))
    const response = await uptimeApi.reportOnline(encoded)

    try {
      const decoded = decode(response.data.data)
      const parsed = JSON.parse(decoded) as {
        reward?: string | number
        timestamp?: number
      }

      if (parsed.reward !== undefined) {
        const amount = typeof parsed.reward === 'number' ? parsed.reward.toString() : parsed.reward
        const timestamp = parsed.timestamp ?? Date.now()
        log.info(`[uptime] ✓ Reward received: ${amount} tokens`)
        rewardStore.saveReward(amount, timestamp)
        this.emit('reward', { amount, timestamp })
      } else {
        log.debug('[uptime] No reward in response')
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error, 'Failed to parse reward response')
      log.error('[uptime] Error parsing reward response:', errorMsg)
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    }

    log.info('[uptime] Cycle reported successfully - creating new cycle')
    const cycle = uptimeStore.createCycle()
    this.emit('cycle', cycle)
  }
}
