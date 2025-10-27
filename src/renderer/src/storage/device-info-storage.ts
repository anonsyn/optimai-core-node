import type { LocalDeviceInfo } from '../../../main/node/types'
import { BaseCacheStore } from './base-cache-store'

/**
 * Storage for local device information with caching
 * Default cache duration: 10 minutes
 */
export class DeviceInfoStorage extends BaseCacheStore<LocalDeviceInfo> {
  protected key = 'local-device-info-storage'

  constructor(maxAge: number = 10 * 60 * 1000) {
    super(maxAge)
  }

  /**
   * Store device info
   */
  setDeviceInfo(deviceInfo: LocalDeviceInfo): void {
    this.setCache(deviceInfo)
  }

  /**
   * Get stored device info if valid
   */
  getDeviceInfo(): LocalDeviceInfo | null {
    return this.getCache()
  }

  /**
   * Get formatted cache age
   */
  getFormattedCacheAge(): string {
    const age = this.getCacheAge()
    if (age === null) {
      return 'No cache'
    }

    const minutes = Math.floor(age / 60000)
    const seconds = Math.floor((age % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`
    }
    return `${seconds}s ago`
  }
}

export const deviceInfoStorage = new DeviceInfoStorage()
