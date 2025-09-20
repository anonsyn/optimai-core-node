import { ipcRenderer } from 'electron'
import { AuthEvents } from './events'

export const authIPC = {
  /**
   * Store access and refresh tokens
   */
  login: (accessToken: string, refreshToken: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(AuthEvents.Login, accessToken, refreshToken),

  /**
   * Get the stored access token
   */
  getAccessToken: (): Promise<string | null> =>
    ipcRenderer.invoke(AuthEvents.GetAccessToken),

  /**
   * Get the stored refresh token
   */
  getRefreshToken: (): Promise<string | null> =>
    ipcRenderer.invoke(AuthEvents.GetRefreshToken),

  /**
   * Update only the access token
   */
  updateAccessToken: (accessToken: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(AuthEvents.UpdateAccessToken, accessToken),

  /**
   * Update only the refresh token (requires existing access token)
   */
  updateRefreshToken: (refreshToken: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(AuthEvents.UpdateRefreshToken, refreshToken),

  /**
   * Remove all tokens (logout)
   */
  logout: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke(AuthEvents.Logout),

  /**
   * Check if tokens exist
   */
  hasTokens: (): Promise<boolean> =>
    ipcRenderer.invoke(AuthEvents.HasTokens)
}

export type AuthIPC = typeof authIPC