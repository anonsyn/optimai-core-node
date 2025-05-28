export const ACCESS_TOKEN_KEY = 'opai_access_token'
export const REFRESH_TOKEN_KEY = 'opai_refresh_token'

export class SessionManager {
  async getAccessToken() {
    const accessToken = await window.authIPC.getAccessToken()
    return `${accessToken}`
  }

  async saveTokens(accessToken: string, refreshToken: string) {
    return window.authIPC.saveTokens(accessToken, refreshToken)
  }
}

export const sessionManager = new SessionManager()
