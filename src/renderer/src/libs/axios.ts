import { BASE_API_URL } from '@/configs/env'
import { sessionManager } from '@/utils/session-manager'
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// List of endpoints that should skip token refresh on 401
const SKIP_REFRESH_ENDPOINTS = ['/auth/signin', '/auth/signin-v1.1', '/auth/token', '/auth/refresh']

// API client with auth interceptor
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_API_URL
})

// Request interceptor
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await sessionManager.getAccessToken()
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
      // Call refresh token endpoint
      const accessToken = await window.nodeIPC.refreshTokenApi()

      if (accessToken) {
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        // Retry original request with new access token
        return axiosClient(originalRequest)
      }

      return Promise.reject(error)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
)

export default axiosClient
