import { ipcMain } from 'electron'
import { nodeCommands } from '../../node/commands'
import { AuthEvents } from './events'

class AuthIpcHandler {
  initialize() {
    ipcMain.on(AuthEvents.GetTokens, () => {
      return nodeCommands.getTokens()
    })
    ipcMain.on(AuthEvents.SaveTokens, (_, accessToken: string, refreshToken: string) => {
      return nodeCommands.saveTokens(accessToken, refreshToken)
    })
    ipcMain.on(AuthEvents.RefreshToken, () => {
      return nodeCommands.refreshToken()
    })
  }
}

const authIpcHandler = new AuthIpcHandler()

export default authIpcHandler
