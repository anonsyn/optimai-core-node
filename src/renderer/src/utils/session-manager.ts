import axiosClient from '@/libs/axios'

export const ACCESS_TOKEN_KEY = 'opai_access_token'
export const REFRESH_TOKEN_KEY = 'opai_refresh_token'

interface Credentials {
  accessToken: string
  refreshToken: string
}

export class SessionManager {
  get accessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
  }

  set accessToken(token: string | undefined) {
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      delete axiosClient.defaults.headers.common['Authorization']
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }

  get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
  }

  set refreshToken(token: string | undefined) {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }

  get credentials(): Credentials | undefined {
    const accessToken = this.accessToken
    const refreshToken = this.refreshToken

    if (!accessToken || !refreshToken) {
      return undefined
    }

    return {
      accessToken,
      refreshToken
    }
  }

  removeTokens() {
    this.accessToken = undefined
    this.refreshToken = undefined
  }
}

export const sessionManager = new SessionManager()
