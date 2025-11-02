import { ipcMain } from 'electron'
import log from '../../configs/logger'
import type { User } from '../../storage'
import { deviceStore, rewardStore, tokenStore, uptimeStore, userStore } from '../../storage'
import { getErrorMessage } from '../../utils/get-error-message'
import { AuthEvents } from './events'

class AuthIpcHandler {
  initialize() {
    // Login - Store access and refresh tokens
    ipcMain.handle(AuthEvents.Login, async (_, accessToken: string, refreshToken: string) => {
      try {
        tokenStore.saveTokens(accessToken, refreshToken)
        log.info('Tokens stored successfully')
        // TODO: fix device id error instead of clear registration
        deviceStore.clearRegistration()

        return { success: true }
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Failed to store tokens')
        log.error('Failed to store tokens:', message)
        return { success: false, error: message }
      }
    })

    // Get access token
    ipcMain.handle(AuthEvents.GetAccessToken, async () => {
      try {
        const token = tokenStore.getAccessToken()
        return token || null
      } catch (error: unknown) {
        log.error(
          'Failed to get access token:',
          getErrorMessage(error, 'Failed to get access token')
        )
        return null
      }
    })

    // Get refresh token
    ipcMain.handle(AuthEvents.GetRefreshToken, async () => {
      try {
        const token = tokenStore.getRefreshToken()
        return token || null
      } catch (error: unknown) {
        log.error(
          'Failed to get refresh token:',
          getErrorMessage(error, 'Failed to get refresh token')
        )
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
        const message = getErrorMessage(error, 'Failed to update access token')
        log.error('Failed to update access token:', message)
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
        const message = getErrorMessage(error, 'Failed to update refresh token')
        log.error('Failed to update refresh token:', message)
        return { success: false, error: message }
      }
    })

    // Logout - Remove tokens and clear all stored data
    ipcMain.handle(AuthEvents.Logout, async () => {
      try {
        tokenStore.removeTokens()
        userStore.removeUser()
        deviceStore.removeDeviceId()
        uptimeStore.removeUptimeData()
        rewardStore.clearRewards()
        log.info('All user data cleared successfully on logout')
        return { success: true }
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Failed to clear user data')
        log.error('Failed to clear user data on logout:', message)
        return { success: false, error: message }
      }
    })

    // Check if tokens exist
    ipcMain.handle(AuthEvents.HasTokens, async () => {
      try {
        return tokenStore.hasTokens()
      } catch (error) {
        log.error('Failed to check tokens:', getErrorMessage(error, 'Failed to check tokens'))
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
        const message = getErrorMessage(error, 'Failed to store user profile')
        log.error('Failed to store user profile:', message)
        return { success: false, error: message }
      }
    })
  }
}

const authIpcHandler = new AuthIpcHandler()

export default authIpcHandler
