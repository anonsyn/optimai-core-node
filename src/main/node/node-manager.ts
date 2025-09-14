/**
 * Node Manager
 * Manages the node process via API calls to the API server
 */

import logger from '../configs/logger'
import { apiClient } from './api-client'
import { NodeStatusResponse } from './types'

class NodeManager {
  /**
   * Start the node via API
   */
  async start(): Promise<boolean> {
    try {
      logger.info('Starting node via API...')
      const response = await apiClient.startNode()

      if (response) {
        logger.info(`Node started successfully: ${response.status}`)
        return true
      } else {
        logger.error('Failed to start node - no response from API')
        return false
      }
    } catch (error) {
      logger.error('Failed to start node:', error)
      return false
    }
  }

  /**
   * Stop the node via API
   */
  async stop(): Promise<boolean> {
    try {
      logger.info('Stopping node via API...')
      const response = await apiClient.stopNode()

      if (response) {
        logger.info(`Node stopped successfully: ${response.status}`)
        return true
      } else {
        logger.error('Failed to stop node - no response from API')
        return false
      }
    } catch (error) {
      logger.error('Failed to stop node:', error)
      return false
    }
  }

  /**
   * Get the current node status via API
   */
  async getStatus(): Promise<NodeStatusResponse | null> {
    try {
      const response = await apiClient.getNodeStatus()
      return response
    } catch (error) {
      logger.error('Failed to get node status:', error)
      return null
    }
  }
}

// Export singleton instance
export const nodeManager = new NodeManager()
