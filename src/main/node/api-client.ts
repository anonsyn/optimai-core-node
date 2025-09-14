import axios, { AxiosInstance } from 'axios'
import logger from '../configs/logger'
import {
  NodeStatusResponse,
  TokensResponse,
  UserResponse,
  UptimeProgressResponse,
  RewardResponse
} from './types'

export class NodeAPIClient {
  private client: AxiosInstance
  private baseURL: string
  private port: number

  constructor(port: number) {
    this.port = port
    this.baseURL = `http://127.0.0.1:${port}`
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add response interceptor for error logging
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
        const url = error.config?.url || 'unknown'
        const status = error.response?.status || 'No response'
        logger.error(`API request failed: ${method} ${url} - Status: ${status} - ${error.message}`)
        return Promise.reject(error)
      }
    )
  }

  // WebSocket URL getter for external WebSocket connections
  getWebSocketURL(): string {
    return `ws://127.0.0.1:${this.port}/ws`
  }

  // Get the port number
  getPort(): number {
    return this.port
  }

  // Get the base URL
  getBaseURL(): string {
    return this.baseURL
  }

  // Update the port (recreates the axios client)
  updatePort(port: number) {
    this.port = port
    this.baseURL = `http://127.0.0.1:${port}`
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Re-add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const method = error.config?.method?.toUpperCase() || 'UNKNOWN'
        const url = error.config?.url || 'unknown'
        const status = error.response?.status || 'No response'
        logger.error(`API request failed: ${method} ${url} - Status: ${status} - ${error.message}`)
        return Promise.reject(error)
      }
    )
  }

  // Health check
  async health(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.data?.status === 'ok'
    } catch (error: any) {
      logger.debug(`Health check failed: ${error.message}`)
      return false
    }
  }

  // Node management
  async getNodeStatus(): Promise<NodeStatusResponse | null> {
    try {
      const response = await this.client.get<NodeStatusResponse>('/node/status')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get node status: ${error.message}`)
      return null
    }
  }

  async startNode(): Promise<NodeStatusResponse | null> {
    try {
      const response = await this.client.post<NodeStatusResponse>('/node/start')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to start node: ${error.message}`)
      return null
    }
  }

  async stopNode(): Promise<NodeStatusResponse | null> {
    try {
      const response = await this.client.post<NodeStatusResponse>('/node/stop')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to stop node: ${error.message}`)
      return null
    }
  }

  async restartNode(): Promise<NodeStatusResponse | null> {
    try {
      const response = await this.client.post<NodeStatusResponse>('/node/restart')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to restart node: ${error.message}`)
      return null
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<TokensResponse | null> {
    try {
      const response = await this.client.post<TokensResponse>('/auth/login', {
        email,
        password
      })
      return response.data
    } catch (error: any) {
      logger.error(`Failed to login: ${error.message}`)
      return null
    }
  }

  async logout(): Promise<boolean> {
    try {
      const response = await this.client.post('/auth/logout')
      return response.data?.success === true
    } catch (error: any) {
      logger.error(`Failed to logout: ${error.message}`)
      return false
    }
  }

  async getMe(): Promise<UserResponse | null> {
    try {
      const response = await this.client.get<UserResponse>('/auth/me')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get user info: ${error.message}`)
      return null
    }
  }

  async getTokens(): Promise<TokensResponse | null> {
    try {
      const response = await this.client.get<TokensResponse>('/auth/tokens')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get tokens: ${error.message}`)
      return null
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await this.client.post<{ access_token: string }>('/auth/refresh')
      return response.data?.access_token || null
    } catch (error: any) {
      logger.error(`Failed to refresh token: ${error.message}`)
      return null
    }
  }

  // Uptime tracking
  async getUptimeProgress(): Promise<UptimeProgressResponse | null> {
    try {
      const response = await this.client.get<UptimeProgressResponse>('/uptime/progress')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get uptime progress: ${error.message}`)
      return null
    }
  }

  async getLatestReward(): Promise<RewardResponse | null> {
    try {
      const response = await this.client.get<RewardResponse>('/uptime/latest_reward')
      return response.data
    } catch (error: any) {
      logger.error(`Failed to get latest reward: ${error.message}`)
      return null
    }
  }
}

// Export singleton instance with default port (will be updated when server is ready)
export const apiClient = new NodeAPIClient(5000)
