import { ipcMain } from 'electron'
import { nodeCommands } from '../../node/commands'
import { AuthEvents } from './events'

class AuthIpcHandler {
  initialize() {
    ipcMain.handle(AuthEvents.GetAccessToken, async () => {
      return nodeCommands.getAccessToken().then((res) => {
        return res.access_token
      })
    })
    ipcMain.handle(AuthEvents.SaveTokens, (_, accessToken: string, refreshToken: string) => {
      return nodeCommands.saveTokens(accessToken, refreshToken)
    })
    ipcMain.handle(AuthEvents.RefreshToken, () => {
      return nodeCommands.refreshToken()
    })
    ipcMain.handle(AuthEvents.Logout, () => {
      return nodeCommands.logout()
    })
  }
}

const authIpcHandler = new AuthIpcHandler()

export default authIpcHandler
