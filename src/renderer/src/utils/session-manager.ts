export class SessionManager {
  async getAccessToken() {
    const tokens = await window.nodeIPC.getTokensApi()
    return tokens?.access_token || null
  }
}

export const sessionManager = new SessionManager()
