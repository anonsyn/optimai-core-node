import { createStore } from './base-store'
import type { User, UserData } from './types'

/**
 * User store for managing user profile information
 */
const store = createStore<UserData>({
  name: 'user',
  defaults: {
    user: undefined
  }
})

export const userStore = {
  /**
   * Save user data
   */
  saveUser(user: User) {
    store.set('user', user)
  },

  /**
   * Get user data
   */
  getUser(): User | undefined {
    return store.get('user')
  },

  /**
   * Update specific user fields
   */
  updateUser(updates: Partial<User>) {
    const currentUser = store.get('user')
    if (currentUser) {
      store.set('user', {
        ...currentUser,
        ...updates
      })
    }
  },

  /**
   * Check if user exists
   */
  hasUser(): boolean {
    return store.has('user') && store.get('user') !== undefined
  },

  /**
   * Remove user data (logout)
   */
  removeUser() {
    store.clear()
  },

  /**
   * Get user email
   */
  getUserEmail(): string | undefined {
    return store.get('user')?.email
  },

  /**
   * Get user ID
   */
  getUserId(): string | undefined {
    return store.get('user')?.id
  },

  /**
   * Get display name or fallback to email
   */
  getDisplayName(): string | undefined {
    const user = store.get('user')
    return user?.display_name || user?.email
  },

  /**
   * Check if user has connected wallet
   */
  hasWallet(): boolean {
    return !!store.get('user')?.wallet_address
  },

  /**
   * Check if user has connected Twitter
   */
  hasTwitter(): boolean {
    return !!store.get('user')?.twitter
  },

  /**
   * Check if user has connected Telegram
   */
  hasTelegram(): boolean {
    return !!store.get('user')?.telegram
  },

  /**
   * Watch for changes
   */
  onDidChange(callback: (user?: User) => void) {
    return store.onDidChange('user', callback)
  }
}
