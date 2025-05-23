import { ipcRenderer } from 'electron'
import { AuthEvents } from './events'

const authIPC = {
  getTokens: () => ipcRenderer.send(AuthEvents.GetTokens),
  saveTokens: (accessToken: string, refreshToken: string) =>
    ipcRenderer.send(AuthEvents.SaveTokens, accessToken, refreshToken),
  refreshToken: () => ipcRenderer.send(AuthEvents.RefreshToken)
}

type AuthIPC = typeof authIPC

export { authIPC, type AuthIPC }
