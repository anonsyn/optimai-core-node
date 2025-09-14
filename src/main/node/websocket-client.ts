/**
 * WebSocket Client
 * Handles WebSocket connections to the API server for real-time updates
 */

import WebSocket from 'ws'
import logger from '../configs/logger'
import { WebSocketMessage } from './types'

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string | null = null
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isIntentionallyClosed = false
  private readonly reconnectInterval = 5000
  private readonly maxReconnectAttempts = 10

  /**
   * Check if the WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(url: string): Promise<boolean> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      logger.warn('WebSocket is already connected')
      return true
    }

    this.url = url
    this.isIntentionallyClosed = false

    return new Promise((resolve) => {
      let connectionTimeout: NodeJS.Timeout | null = null

      try {
        logger.info(`Connecting to WebSocket: ${url}`)

        this.ws = new WebSocket(url)

        // Set up event handlers
        this.ws.on('open', () => {
          logger.info('WebSocket connected')
          this.reconnectAttempts = 0
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
            connectionTimeout = null
          }
          resolve(true)
        })

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message: WebSocketMessage = JSON.parse(data.toString())
            logger.debug(`WebSocket message received: ${message.event}`)
            // Handle message internally or emit to event system if needed
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error)
          }
        })

        this.ws.on('error', (error: Error) => {
          logger.error('WebSocket error:', error)
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
            connectionTimeout = null
          }
        })

        this.ws.on('close', (code: number, reason: Buffer) => {
          const reasonStr = reason.toString()
          logger.info(`WebSocket disconnected: code=${code}, reason=${reasonStr}`)
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
            connectionTimeout = null
          }
          this.handleDisconnect()
        })

        // Set a timeout for initial connection
        connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            logger.error('WebSocket connection timeout')
            this.ws?.close()
            resolve(false)
          }
        }, 10000)
      } catch (error) {
        logger.error('Failed to create WebSocket connection:', error)
        resolve(false)
      }
    })
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    logger.info('Disconnecting WebSocket...')
    this.isIntentionallyClosed = true

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Handle disconnection and potential reconnection
   */
  private handleDisconnect() {
    this.ws = null

    if (this.isIntentionallyClosed) {
      logger.info('WebSocket was intentionally closed')
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Maximum WebSocket reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    logger.info(
      `Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts}) in ${this.reconnectInterval}ms...`
    )

    this.reconnectTimeout = setTimeout(() => {
      if (this.url && !this.isIntentionallyClosed) {
        this.connect(this.url)
      }
    }, this.reconnectInterval)
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.disconnect()
    this.url = null
    this.reconnectAttempts = 0
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient()
