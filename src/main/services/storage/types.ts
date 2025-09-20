/**
 * Storage types for all stores
 */

// Token Store Types
export interface TokenData {
  access_token?: string
  refresh_token?: string
}

// User Store Types
export interface User {
  id: string
  display_name?: string
  wallet_address?: string
  email: string
  has_nodes?: boolean
  joined_at: string
  encrypted_private_key?: string
  telegram?: {
    first_name: string
    last_name: string
    photo_url: string
  }
  twitter?: {
    id: string
    name: string
    username: string
  }
}

export interface UserData {
  user?: User
}

// Uptime Store Types
export interface UptimeData {
  uptime: number // milliseconds of uptime
  created_at: number // cycle start timestamp
  updated_at: number // last update timestamp
  refresh_at: number // when cycle expires
}

export interface UptimeStoreData {
  uptime_data?: UptimeData
}

// Reward Store Types
export interface RewardData {
  amount: string // Reward amount as string for precision
  timestamp: number // When reward was received
}

export interface RewardStoreData {
  latest_reward?: RewardData
  total_rewards?: string // Total accumulated rewards
  reward_count?: number // Number of rewards received
}

// Device Store Types
export interface DeviceData {
  device_id?: string
  device_name?: string
  platform?: string
  arch?: string
  registered_at?: number
}

// System Info Type
export interface SystemInfo {
  hostname: string
  platform: NodeJS.Platform
  arch: string
  cpus: number
  memory: number
  release: string
}

// Common Store Options
export interface StoreOptions<T> {
  name: string
  encryptionKey?: string
  defaults?: T
}