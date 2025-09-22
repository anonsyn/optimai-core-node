import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { tokenStore, userStore } from '../../storage'
import type { User } from '../../storage'
import { AuthEvents } from './events'

class AuthIpcHandler {
  initialize() {
    // Login - Store access and refresh tokens
    ipcMain.handle(AuthEvents.Login, async (_, accessToken: string, refreshToken: string) => {
      try {
        tokenStore.saveTokens(accessToken, refreshToken)
        log.info('Tokens stored successfully')
        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log.error('Failed to store tokens:', error)
        return { success: false, error: message }
      }
    })

    // Get access token
    ipcMain.handle(AuthEvents.GetAccessToken, async () => {
      try {
        const token = tokenStore.getAccessToken()
        return token || null
      } catch (error: unknown) {
        log.error('Failed to get access token:', error)
        return null
      }
    })

    // Get refresh token
    ipcMain.handle(AuthEvents.GetRefreshToken, async () => {
      try {
        const token = tokenStore.getRefreshToken()
        return token || null
      } catch (error: unknown) {
        log.error('Failed to get refresh token:', error)
        return null
      }
    })

    // Update access token
    ipcMain.handle(AuthEvents.UpdateAccessToken, async (_, accessToken: string) => {
      try {
        tokenStore.saveAccessToken(accessToken)
        log.info('Access token updated successfully')
        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log.error('Failed to update access token:', error)
        return { success: false, error: message }
      }
    })

    // Update refresh token
    ipcMain.handle(AuthEvents.UpdateRefreshToken, async (_, refreshToken: string) => {
      try {
        // Since we don't have a method to update only refresh token,
        // we need to get the current access token first
        const currentAccessToken = tokenStore.getAccessToken()
        if (currentAccessToken) {
          tokenStore.saveTokens(currentAccessToken, refreshToken)
        } else {
          // If no access token, we can't update just refresh token
          // This is a design decision to maintain token pair integrity
          throw new Error('Cannot update refresh token without access token')
        }
        log.info('Refresh token updated successfully')
        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log.error('Failed to update refresh token:', error)
        return { success: false, error: message }
      }
    })

    // Logout - Remove tokens
    ipcMain.handle(AuthEvents.Logout, async () => {
      try {
        tokenStore.removeTokens()
        userStore.removeUser()
        log.info('Tokens removed successfully')
        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log.error('Failed to remove tokens:', error)
        return { success: false, error: message }
      }
    })

    // Check if tokens exist
    ipcMain.handle(AuthEvents.HasTokens, async () => {
      try {
        return tokenStore.hasTokens()
      } catch (error) {
        log.error('Failed to check tokens:', error)
        return false
      }
    })

    // Save user profile data
    ipcMain.handle(AuthEvents.SaveUser, async (_event, user: User) => {
      try {
        if (!user || typeof user !== 'object') {
          throw new Error('Invalid user payload')
        }

        userStore.saveUser(user)
        log.info('User profile stored successfully')
        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)
        log.error('Failed to store user profile:', error)
        return { success: false, error: message }
      }
    })
  }
}

const authIpcHandler = new AuthIpcHandler()

export default authIpcHandler
