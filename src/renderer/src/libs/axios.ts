import { BASE_API_URL, BASE_MINER_URL } from '@/configs/env'
import { sessionManager } from '@/utils/session-manager'
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// List of endpoints that should skip token refresh on 401
const SKIP_REFRESH_ENDPOINTS = ['/auth/signin', '/auth/signin-v1.1', '/auth/token', '/auth/refresh']

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
    timeout: options.timeout || 10000,
    headers: {
      'Content-Type': 'application/json',
      ...options.customHeaders
    }
  })

  // Request interceptor - Add auth token if not skipped
  if (!options.skipAuth) {
    client.interceptors.request.use(
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
  }

  // Response interceptor - Handle 401 and refresh token
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config

      if (!originalRequest || options.skipAuth) {
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
        // Call refresh token endpoint through IPC
        const accessToken = await window.nodeIPC.refreshTokenApi()

        if (accessToken) {
          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          // Retry original request with new access token
          return client(originalRequest)
        }

        return Promise.reject(error)
      } catch (refreshError) {
        return Promise.reject(refreshError)
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
 * Local CLI API client for node control operations
 * This client dynamically gets the port from IPC on each request
 * Note: This client doesn't use authentication as it's local
 */
export const localClient = {
  /**
   * Get the current API server port from the main process
   */
  async getPort(): Promise<number> {
    const port = await window.nodeIPC.getServerPort()
    if (!port) {
      throw new Error('API server port not available')
    }
    return port
  },

  /**
   * Get the base URL for the local API server
   */
  async getBaseURL(): Promise<string> {
    const port = await this.getPort()
    return `http://127.0.0.1:${port}`
  },

  /**
   * Get WebSocket URL for real-time updates
   */
  async getWebSocketURL(): Promise<string> {
    const port = await this.getPort()
    return `ws://127.0.0.1:${port}/ws`
  },

  /**
   * Perform a GET request to the local API server
   */
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    const baseURL = await this.getBaseURL()
    return axios.get<T>(url, {
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    })
  },

  /**
   * Perform a POST request to the local API server
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    const baseURL = await this.getBaseURL()
    return axios.post<T>(url, data, {
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    })
  },

  /**
   * Perform a PUT request to the local API server
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    const baseURL = await this.getBaseURL()
    return axios.put<T>(url, data, {
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    })
  },

  /**
   * Perform a PATCH request to the local API server
   */
  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    const baseURL = await this.getBaseURL()
    return axios.patch<T>(url, data, {
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    })
  },

  /**
   * Perform a DELETE request to the local API server
   */
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    const baseURL = await this.getBaseURL()
    return axios.delete<T>(url, {
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...config
    })
  }
}

// Legacy default export for backward compatibility
// Old code can still use: import axiosClient from '@/libs/axios'
const axiosClient = apiClient
export default axiosClient