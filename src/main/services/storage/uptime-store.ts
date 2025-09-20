import { createStore } from './base-store'
import type { UptimeData, UptimeStoreData } from './types'

/**
 * Get cycle duration based on environment
 * Production: 60 seconds, Development: 30 seconds
 */
function getCycleDuration(): number {
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction ? 60000 : 30000 // 60s for prod, 30s for dev
}

/**
 * Uptime store for managing node uptime tracking
 */
const store = createStore<UptimeStoreData>({
  name: 'emitpu', // 'uptime' backwards for obscurity, matching CLI pattern
  defaults: {
    uptime_data: undefined
  }
})

export const uptimeStore = {
  /**
   * Get current uptime data or create new cycle
   */
  getData(): UptimeData {
    const data = store.get('uptime_data')

    if (!data) {
      // Create new cycle if none exists
      return this.createCycle()
    }

    // Check if cycle expired and create new one if needed
    if (this.isExpired()) {
      return this.createCycle()
    }

    return data
  },

  /**
   * Create a new uptime cycle
   */
  createCycle(): UptimeData {
    const now = Date.now()
    const newCycle: UptimeData = {
      uptime: 0,
      created_at: now,
      updated_at: now,
      refresh_at: now + getCycleDuration()
    }
    store.set('uptime_data', newCycle)
    return newCycle
  },

  /**
   * Save uptime data
   */
  setData(uptimeData: UptimeData) {
    store.set('uptime_data', uptimeData)
  },

  /**
   * Increase uptime by duration (default 1000ms)
   */
  increaseUptime(duration: number = 1000): UptimeData {
    const uptimeData = this.getData()
    uptimeData.uptime += duration
    uptimeData.updated_at = Date.now()
    store.set('uptime_data', uptimeData)
    return uptimeData
  },

  /**
   * Check if current cycle is expired
   */
  isExpired(): boolean {
    const data = store.get('uptime_data')
    if (!data) return true
    return Date.now() >= data.refresh_at
  },

  /**
   * Remove uptime data (reset)
   */
  removeUptimeData() {
    store.clear()
  },

  /**
   * Get current cycle progress (0-100)
   */
  getProgress(): number {
    const data = this.getData()
    const cycleDuration = getCycleDuration()
    const elapsed = Date.now() - data.created_at
    return Math.min(100, (elapsed / cycleDuration) * 100)
  },

  /**
   * Get remaining time in current cycle
   */
  getRemainingTime(): number {
    const data = this.getData()
    return Math.max(0, data.refresh_at - Date.now())
  },

  /**
   * Get total uptime in current cycle
   */
  getTotalUptime(): number {
    const data = this.getData()
    return data.uptime
  },

  /**
   * Force complete current cycle and start new one
   */
  completeCycle(): UptimeData {
    return this.createCycle()
  },

  /**
   * Watch for changes
   */
  onDidChange(callback: (data?: UptimeData) => void) {
    return store.onDidChange('uptime_data', callback)
  }
}