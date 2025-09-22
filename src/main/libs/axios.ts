import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'

// Get environment variables with defaults
const BASE_API_URL = process.env.VITE_API_URL || 'https://api.optimai.network'
const BASE_MINER_URL = process.env.VITE_MINER_URL || 'https://api-onchain-staging.optimai.network'

// Types
interface RefreshTokenResponse {
  access_token: string
}

// List of endpoints that should skip token refresh on 401
const SKIP_REFRESH_ENDPOINTS = ['/auth/signin', '/auth/signin-v1.1', '/auth/token', '/auth/refresh']

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
      const token = tokenStore.getAccessToken()
      if (token) {
        prom.resolve(token)
      } else {
        prom.reject(new Error('No access token available'))
      }
    }
  })
  failedQueue = []
}

/**
 * Creates an axios instance with authentication interceptors
 * @param baseURL - The base URL for the axios instance
 * @param options - Additional options for customizing the instance
 */
function createAuthenticatedClient(
  baseURL: string,
  options: {
    skipAuth?: boolean
    timeout?: number
    customHeaders?: Record<string, string>
  } = {}
): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 30000, // 30 seconds for main process
    headers: {
      'Content-Type': 'application/json',
      ...options.customHeaders
    }
  })

  // Request interceptor - Add auth token if not skipped
  if (!options.skipAuth) {
    client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = tokenStore.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )
  }

  // Response interceptor - Handle 401 and refresh token
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (!originalRequest || options.skipAuth) {
        return Promise.reject(error)
      }

      // Check if the endpoint should skip token refresh
      const shouldSkipRefresh = SKIP_REFRESH_ENDPOINTS.some((endpoint) =>
        originalRequest.url?.includes(endpoint)
      )

      // If error is not 401, or endpoint should skip refresh, or already retried, reject
      if (error.response?.status !== 401 || shouldSkipRefresh || originalRequest._retry) {
        return Promise.reject(error)
      }

      // Mark this request as retried to avoid infinite loops
      originalRequest._retry = true

      try {
        const refreshToken = tokenStore.getRefreshToken()
        if (!refreshToken) {
          // No refresh token available, reject original error
          return Promise.reject(error)
        }

        if (isRefreshing) {
          // If token refresh is in progress, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return client(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        isRefreshing = true

        // Call refresh token endpoint directly (not through interceptor)
        const response = await axios.post<RefreshTokenResponse>(`${BASE_API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        })

        const { access_token: accessToken } = response.data

        // Update access token in store
        tokenStore.saveAccessToken(accessToken)

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        // Process queued requests
        processQueue()

        // Retry original request with new access token
        return client(originalRequest)
      } catch (refreshError) {
        // Token refresh failed, process queue with error
        processQueue(refreshError)

        // Clear tokens
        tokenStore.removeTokens()

        // Log error
        console.error(
          'Token refresh failed:',
          getErrorMessage(refreshError, 'Token refresh failed')
        )

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
  )

  return client
}

/**
 * Main API client for general backend operations
 * Points to the main OptimAI API server
 */
export const apiClient = createAuthenticatedClient(BASE_API_URL)

/**
 * Miner/On-chain API client for blockchain and mining operations
 * Points to the on-chain service
 */
export const minerClient = createAuthenticatedClient(BASE_MINER_URL, {
  customHeaders: {
    'X-Service': 'miner'
  }
})

/**
 * Create an unauthenticated client for public endpoints (e.g., login, signup)
 */
export const publicClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})
