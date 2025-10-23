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
   * Check if device info needs refresh
   */
  needsRefresh(): boolean {
    return !this.isCacheValid()
  }

  /**
   * Get formatted remaining time
   */
  getFormattedRemainingTime(): string {
    const remaining = this.getRemainingTime()
    if (remaining <= 0) {
      return 'Expired'
    }

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
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

// Singleton instance
let deviceInfoStorageInstance: DeviceInfoStorage | null = null

/**
 * Get or create the device info storage instance
 */
export function getDeviceInfoStorage(): DeviceInfoStorage {
  if (!deviceInfoStorageInstance) {
    deviceInfoStorageInstance = new DeviceInfoStorage()
  }
  return deviceInfoStorageInstance
}

/**
 * Hook to use device info storage
 */
export function useDeviceInfoStorage(): DeviceInfoStorage {
  return getDeviceInfoStorage()
}
