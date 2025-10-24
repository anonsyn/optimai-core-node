import os from 'os'
import { createStore } from './base-store'
import type { DeviceData } from './types'

/**
 * Device store for managing device identification
 */
const store = createStore<DeviceData>({
  name: 'device_v2',
  defaults: {
    device_id: undefined,
    device_name: undefined,
    platform: undefined,
    arch: undefined,
    registered_at: undefined
  }
})

export const deviceStore = {
  /**
   * Save device ID and metadata
   * Device ID must be provided by the backend after registration
   */
  saveDeviceId(deviceId: string): string {
    store.set('device_id', deviceId)
    store.set('device_name', os.hostname())
    store.set('platform', process.platform)
    store.set('arch', process.arch)
    store.set('registered_at', Date.now())

    return deviceId
  },

  /**
   * Get device ID (returns undefined if not registered)
   */
  getDeviceId(): string | undefined {
    return store.get('device_id')
  },

  /**
   * Get device metadata
   */
  getDeviceInfo() {
    return {
      deviceId: this.getDeviceId(),
      deviceName: store.get('device_name'),
      platform: store.get('platform'),
      arch: store.get('arch'),
      registeredAt: store.get('registered_at')
    }
  },

  /**
   * Check if device is registered
   */
  isRegistered(): boolean {
    return store.has('device_id') && store.has('registered_at')
  },

  /**
   * Remove device data (unregister)
   */
  removeDeviceId() {
    store.clear()
  },

  /**
   * Update device name
   */
  updateDeviceName(name: string) {
    store.set('device_name', name)
  },

  /**
   * Get registration age in milliseconds
   */
  getRegistrationAge(): number | null {
    const registeredAt = store.get('registered_at')
    if (!registeredAt) return null
    return Date.now() - registeredAt
  },

  /**
   * Clear device registration data
   * After calling this, device must be re-registered with backend to get new ID
   */
  clearRegistration() {
    store.clear()
  },

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      hostname: os.hostname(),
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      memory: os.totalmem(),
      release: os.release()
    }
  },

  /**
   * Watch for changes
   */
  onDidChange(callback: () => void) {
    return store.onDidAnyChange(callback)
  }
}
