/**
 * Export all store instances and types
 * Each store is a singleton that can be imported directly
 */

// Export store instances
export { tokenStore } from './token-store'
export { userStore } from './user-store'
export { uptimeStore } from './uptime-store'
export { rewardStore } from './reward-store'
export { deviceStore } from './device-store'

// Export all types
export type {
  // Token types
  TokenData,

  // User types
  User,
  UserData,

  // Uptime types
  UptimeData,
  UptimeStoreData,

  // Reward types
  RewardData,
  RewardStoreData,

  // Device types
  DeviceData,
  SystemInfo,

  // Common types
  StoreOptions
} from './types'