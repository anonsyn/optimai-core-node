import crypto from 'crypto'
import { machineIdSync } from 'node-machine-id'
import os from 'os'
import { createStore } from './base-store'
import type { DeviceData } from './types'

/**
 * Device store for managing device identification
 */
const store = createStore<DeviceData>({
  name: 'device',
  defaults: {
    device_id: undefined,
    device_name: undefined,
    platform: undefined,
    arch: undefined,
    registered_at: undefined
  }
})

/**
 * Generate a unique device ID based on machine hardware
 */
function generateDeviceId(): string {
  try {
    const machineId = machineIdSync(true) // true = use original value
    // Hash the machine ID for privacy
    return crypto.createHash('sha256').update(machineId).digest('hex')
  } catch (error) {
    // Fallback to random ID if machine ID fails
    console.error('Failed to get machine ID:', error)
    return crypto.randomBytes(32).toString('hex')
  }
}

export const deviceStore = {
  /**
   * Save device ID and metadata
   */
  saveDeviceId(deviceId?: string): string {
    const id = deviceId || generateDeviceId()

    store.set('device_id', id)
    store.set('device_name', os.hostname())
    store.set('platform', process.platform)
    store.set('arch', process.arch)
    store.set('registered_at', Date.now())

    return id
  },

  /**
   * Get device ID (generate if not exists)
   */
  getDeviceId(): string {
    let deviceId = store.get('device_id')

    if (!deviceId) {
      deviceId = this.saveDeviceId()
    }

    return deviceId
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
   * Re-register device (generate new ID)
   */
  reregister(): string {
    store.clear()
    return this.saveDeviceId()
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
