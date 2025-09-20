import type { BaseApiQueryParams } from '../types'

export enum DeviceType {
  EXTENSION = 'extension',
  MOBILE = 'mobile',
  PC = 'pc',
  TELEGRAM = 'telegram'
}
export interface Device {
  id: string
  fingerprint: string
  name: string
  device_type: string
  last_used_at: string
  created_at: string
  status: string
}

export const browserName = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  EDGE: 'edge',
  OPERA: 'opera',
  BRAVE: 'brave'
} as const

export type BrowserName = (typeof browserName)[keyof typeof browserName]

export interface DeviceInfo {
  // Level 1: Generated Unique Identifiers
  machine_id?: string // Desktop only (from node-machine-id)
  extension_id?: string // Extension only (from chrome-extension-id)
  device_id?: string // Mobile only (iOS UUID or Android ID)
  browser_id?: string // Browser only (FingerprintJS visitor ID)
  os_name?: string
  os_version?: string

  // Level 2: Raw Device Characteristics
  cpu_cores?: number // Optional: Available in most environments
  memory_gb?: number // Optional: Not always available

  // Level 3: Display Information
  screen_width_px: number
  screen_height_px: number
  color_depth: number
  scale_factor: number

  // Level 4: Advanced Fingerprinting
  canvas_hash?: string // Canvas fingerprint hash
  webgl_vendor?: string // WebGL vendor info
  webgl_renderer?: string // WebGL renderer info
  audio_hash?: string // Audio fingerprint hash

  // Level 5: Device-Specific Information
  device_model?: string
  device_brand?: string
  device_type: DeviceType
  browser_name?: BrowserName

  // Level 6: Browser Information
  language: string // Required: Generally reliable
  timezone: string // Required: Timezone info

  // Level 7: FingerprintJS Components, only for debugging purposes and not used in the device registration process.
  // Only Telegram devices have this
}

export interface DeviceDetail {
  id: string
  name: string
  device_type: string
  last_used_at: string
  created_at: string
  total_uptime: number
  total_rewards: number
  ip_address: string
  country: string
  country_code2: string
  status?: string
}

export interface GetDevicesParams extends BaseApiQueryParams {}

export interface GetDevicesResponse {
  items: Device[]
  total: number
}

export interface GetDeviceByIdResponse {
  detail: DeviceDetail
}

export interface ClientToken {
  // Unique identifier for this specific client app version
  client_app_id: string

  // Timestamp to prevent replay attacks
  timestamp: number

  // Device info for verification
  device_info: DeviceInfo

  // Cryptographic signature to verify token integrity
  signature: string
}

export type RegisterDeviceRequest = {
  data: string
}

export type RegisterDeviceResponse = {
  data: string
}
