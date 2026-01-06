import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'

// Get environment variables with defaults
const normalizeBaseUrl = (value: string): string => {
  try {
    const url = new URL(value)
    // Prefer IPv4 loopback to avoid environments where ::1 is not bound.
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1'
    }
    return url.toString()
  } catch {
    return value
  }
}

const isLoopbackBaseUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost'
  } catch {
    return false
  }
}

const BASE_API_URL = normalizeBaseUrl(process.env.VITE_API_URL || 'https://api.optimai.network')
const BASE_MINER_URL = normalizeBaseUrl(
  process.env.VITE_MINER_URL || 'https://api-onchain.optimai.network/'
)

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

const serializeParams = (params?: Record<string, unknown> | URLSearchParams | string): string => {
  if (!params) {
    return ''
  }

  if (typeof params === 'string') {
    return params
  }

  if (params instanceof URLSearchParams) {
    return params.toString()
  }

  const searchParams = new URLSearchParams()

  const appendValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(key, item))
      return
    }

    if (value instanceof Date) {
      searchParams.append(key, value.toISOString())
      return
    }

    if (typeof value === 'object') {
      searchParams.append(key, JSON.stringify(value))
      return
    }

    searchParams.append(key, String(value))
  }

  Object.entries(params).forEach(([key, value]) => appendValue(key, value))

  return searchParams.toString()
}

/**
 * Creates an axios instance with authentication interceptors
 * @param baseURL - The base URL for the axios instance
 * @param options - Additional options for customizing the instance
 */
function createApiCLient(
  baseURL: string,
  options: {
    skipAuth?: boolean
    timeout?: number
    customHeaders?: Record<string, string>
    disableProxy?: boolean
  } = {}
): AxiosInstance {
  const loopback = isLoopbackBaseUrl(baseURL)
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 180000, // 3 minutes for main process
    // Avoid env proxy settings for localhost; proxying loopback can cause intermittent hangs/timeouts.
    ...(loopback || options.disableProxy ? { proxy: false } : {}),
    headers: {
      'Content-Type': 'application/json',
      ...options.customHeaders
    },
    paramsSerializer: {
      serialize: serializeParams
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

        // // Clear tokens
        // tokenStore.removeTokens()

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
export const apiClient = createApiCLient(BASE_API_URL)

/**
 * Miner/On-chain API client for blockchain and mining operations
 * Points to the on-chain service
 */
export const minerClient = createApiCLient(BASE_MINER_URL, {
  // Avoid proxying miner traffic; proxy CONNECTs can stall and cause client timeouts.
  disableProxy: true
})

/**
 * Create an unauthenticated client for public endpoints (e.g., login, signup)
 */
export const publicClient = axios.create({
  baseURL: BASE_API_URL
})
