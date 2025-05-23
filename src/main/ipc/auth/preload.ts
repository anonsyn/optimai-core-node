import { ipcRenderer } from 'electron'
import { AuthEvents } from './events'

const authIPC = {
  getAccessToken: (): Promise<string> => ipcRenderer.invoke(AuthEvents.GetAccessToken),
  saveTokens: (accessToken: string, refreshToken: string) =>
    ipcRenderer.invoke(AuthEvents.SaveTokens, accessToken, refreshToken),
  refreshToken: () => ipcRenderer.invoke(AuthEvents.RefreshToken),
  logout: () => ipcRenderer.invoke(AuthEvents.Logout)
}

type AuthIPC = typeof authIPC

export { authIPC, type AuthIPC }
