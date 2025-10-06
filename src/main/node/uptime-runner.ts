import EventEmitter from 'eventemitter3'

import { DeviceType } from '../api/device/types'
import { uptimeApi } from '../api/uptime'
import type { UptimeData } from '../storage'
import { deviceStore, rewardStore, uptimeStore, userStore } from '../storage'
import { decode, encode } from '../utils/encoder'

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

  start() {
    if (this.running) {
      return
    }

    const cycle = uptimeStore.getData()
    this.emit('cycle', cycle)

    this.running = true
    this.schedule(0)
  }

  stop() {
    this.running = false

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    this.inFlight = false
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
      return
    }

    if (this.inFlight) {
      this.schedule(1000)
      return
    }

    this.inFlight = true

    try {
      const data = uptimeStore.getCurrentCycle()

      if (!data) {
        const cycle = uptimeStore.createCycle()
        this.emit('cycle', cycle)
      } else if (Date.now() >= data.refresh_at) {
        await this.reportCycle(data)
      } else {
        uptimeStore.increaseUptime(this.intervalMs)
        const updated = uptimeStore.getData()
        this.emit('cycle', updated)
      }
    } catch (error) {
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
      throw new Error('User information not available')
    }

    const deviceId = deviceStore.getDeviceId()

    const maxDuration = data.refresh_at - data.created_at
    const duration = Math.min(data.uptime, maxDuration)

    if (duration <= 1000) {
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
        rewardStore.saveReward(amount, timestamp)
        this.emit('reward', { amount, timestamp })
      }
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)))
    }

    const cycle = uptimeStore.createCycle()
    this.emit('cycle', cycle)
  }
}
