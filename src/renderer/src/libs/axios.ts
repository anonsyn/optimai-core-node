import { BASE_API_URL } from '@/configs/env'
import { sessionManager } from '@/utils/session-manager'
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Types
interface RefreshTokenResponse {
  access_token: string
}

// List of endpoints that should skip token refresh on 401
const SKIP_REFRESH_ENDPOINTS = ['/auth/signin', '/auth/signin-v1.1', '/auth/token', '/auth/refresh']

// API client with auth interceptor
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_API_URL
})

// Flag to prevent multiple refresh token requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      const accessToken = sessionManager.accessToken
      if (accessToken) {
        prom.resolve(accessToken)
      } else {
        prom.reject(new Error('No access token found'))
      }
    }
  })
  failedQueue = []
}

// Request interceptor
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = sessionManager.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Check if the endpoint should skip token refresh
    const shouldSkipRefresh = SKIP_REFRESH_ENDPOINTS.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    )

    // If error is not 401, or endpoint should skip refresh, reject
    if (error.response?.status !== 401 || shouldSkipRefresh) {
      return Promise.reject(error)
    }

    try {
      const refreshToken = sessionManager.refreshToken
      if (!refreshToken) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      // Call refresh token endpoint
      const response = await axios.post<RefreshTokenResponse>(`${BASE_API_URL}/auth/refresh`, {
        refresh_token: refreshToken
      })

      const { access_token: accessToken } = response.data

      // Update tokens
      sessionManager.accessToken = accessToken

      // Update authorization header
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      // Process queued requests
      processQueue()

      // Retry original request with new access token
      return axiosClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      sessionManager.removeTokens()
      // Redirect to login or handle token refresh failure
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosClient
