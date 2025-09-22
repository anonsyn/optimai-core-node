/**
 * SessionManager for handling authentication tokens in the renderer process
 * Uses authIPC to communicate with the main process token store
 */
export class SessionManager {
  /**
   * Get the current access token
   */
  async getAccessToken(): Promise<string | null> {
    return window.authIPC.getAccessToken()
  }

  /**
   * Get the current refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return window.authIPC.getRefreshToken()
  }

  /**
   * Set/update the access token
   */
  async setAccessToken(accessToken: string): Promise<void> {
    const result = await window.authIPC.updateAccessToken(accessToken)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update access token')
    }
  }

  /**
   * Set/update the refresh token
   */
  async setRefreshToken(refreshToken: string): Promise<void> {
    const result = await window.authIPC.updateRefreshToken(refreshToken)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update refresh token')
    }
  }

  /**
   * Set both tokens at once (used after login)
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const result = await window.authIPC.login(accessToken, refreshToken)
    if (!result.success) {
      throw new Error(result.error || 'Failed to set tokens')
    }
  }

  /**
   * Persist user profile information in the main process store
   */
  async setUser(user: unknown): Promise<void> {
    const result = await window.authIPC.saveUser(user)
    if (!result.success) {
      throw new Error(result.error || 'Failed to store user profile')
    }
  }

  /**
   * Check if user is authenticated (has tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    return window.authIPC.hasTokens()
  }

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    const result = await window.authIPC.logout()
    if (!result.success) {
      throw new Error(result.error || 'Failed to clear tokens')
    }
  }
}

export const sessionManager = new SessionManager()
