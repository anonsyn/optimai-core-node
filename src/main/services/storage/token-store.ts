import { createStore } from './base-store'
import type { TokenData } from './types'

/**
 * Token store for managing authentication tokens
 */
const store = createStore<TokenData>({
  name: 'nekot', // 'token' backwards for obscurity, matching CLI pattern
  defaults: {
    access_token: undefined,
    refresh_token: undefined
  }
})

export const tokenStore = {
  /**
   * Save both access and refresh tokens
   */
  saveTokens(accessToken: string, refreshToken: string) {
    store.set('access_token', accessToken)
    store.set('refresh_token', refreshToken)
  },

  /**
   * Update only the access token
   */
  saveAccessToken(accessToken: string) {
    store.set('access_token', accessToken)
  },

  /**
   * Get the access token
   */
  getAccessToken(): string | undefined {
    return store.get('access_token')
  },

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | undefined {
    return store.get('refresh_token')
  },

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return store.has('access_token') && store.has('refresh_token')
  },

  /**
   * Check if access token exists
   */
  hasAccessToken(): boolean {
    return store.has('access_token')
  },

  /**
   * Remove all tokens (logout)
   */
  removeTokens() {
    store.clear()
  },

  /**
   * Get both tokens at once
   */
  getTokens() {
    return {
      accessToken: store.get('access_token'),
      refreshToken: store.get('refresh_token')
    }
  },

  /**
   * Watch for changes
   */
  onDidChange(callback: () => void) {
    return store.onDidAnyChange(callback)
  }
}