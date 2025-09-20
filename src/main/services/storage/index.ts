/**
 * Export all store instances and types
 * Each store is a singleton that can be imported directly
 */

// Export store instances
export { deviceStore } from './device-store'
export { rewardStore } from './reward-store'
export { tokenStore } from './token-store'
export { uptimeStore } from './uptime-store'
export { userStore } from './user-store'

// Export all types
export type {
  // Device types
  DeviceData,
  // Reward types
  RewardData,
  RewardStoreData,
  // Common types
  StoreOptions,
  SystemInfo,
  // Token types
  TokenData,
  // Uptime types
  UptimeData,
  UptimeStoreData,
  // User types
  User,
  UserData
} from './types'
