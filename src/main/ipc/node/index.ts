import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { apiClient } from '../../node/api-client'
import { apiServer } from '../../node/api-server'
import { nodeManager } from '../../node/node-manager'
import { websocketClient } from '../../node/websocket-client'
import { NodeEvents } from './events'

class NodeIpcHandler {
  constructor() {
    // Listen to API server events
    apiServer.on('ready', (port) => {
      log.info(`API server ready on port ${port}`)
      apiClient.updatePort(port)

      // Connect WebSocket when server is ready
      const wsUrl = `ws://127.0.0.1:${port}/ws`
      websocketClient.connect(wsUrl).then((connected) => {
        if (connected) {
          log.info('WebSocket connected successfully')
        } else {
          log.error('Failed to connect WebSocket')
        }
      })
    })

    apiServer.on('stopped', () => {
      log.info('API server stopped')
      websocketClient.disconnect()
    })

    apiServer.on('error', (error) => {
      log.error('API server error:', error)
    })

    apiServer.on('restarting', () => {
      log.info('API server is restarting...')
      websocketClient.disconnect()
    })

    // Start the API server (non-blocking)
    apiServer.start()
  }

  initialize() {
    // API Server
    ipcMain.handle(NodeEvents.GetServerStatus, async () => {
      return {
        isRunning: apiServer.isRunning(),
        isReady: apiServer.isReady(),
        port: apiServer.getPort()
      }
    })

    ipcMain.handle(NodeEvents.GetServerUrl, async () => {
      const port = apiServer.getPort()
      return port ? `http://127.0.0.1:${port}` : null
    })

    ipcMain.handle(NodeEvents.GetServerPort, async () => {
      return apiServer.getPort()
    })

    // WebSocket
    ipcMain.handle(NodeEvents.GetWebSocketStatus, async () => {
      return websocketClient.isConnected()
    })

    // Node Operations
    ipcMain.handle(NodeEvents.StartNode, async () => {
      return nodeManager.start()
    })

    ipcMain.handle(NodeEvents.StopNode, async () => {
      return nodeManager.stop()
    })

    ipcMain.handle(NodeEvents.GetNodeStatus, async () => {
      return nodeManager.getStatus()
    })

    // API Calls - Authentication
    ipcMain.handle(NodeEvents.LoginApi, async (_, email: string, password: string) => {
      return apiClient.login(email, password)
    })

    ipcMain.handle(NodeEvents.LogoutApi, async () => {
      return apiClient.logout()
    })

    ipcMain.handle(NodeEvents.GetUserApi, async () => {
      return apiClient.getMe()
    })

    ipcMain.handle(NodeEvents.GetTokensApi, async () => {
      return apiClient.getTokens()
    })

    ipcMain.handle(NodeEvents.RefreshTokenApi, async () => {
      return apiClient.refreshToken()
    })

    // API Calls - Uptime & Rewards
    ipcMain.handle(NodeEvents.GetUptimeApi, async () => {
      return apiClient.getUptimeProgress()
    })

    ipcMain.handle(NodeEvents.GetRewardApi, async () => {
      return apiClient.getLatestReward()
    })
  }

  async cleanup() {
    websocketClient.cleanup()
    await apiServer.stop()
  }
}

const nodeIpcHandler = new NodeIpcHandler()

export default nodeIpcHandler
