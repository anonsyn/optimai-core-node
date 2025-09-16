/**
 * API Server Management
 * Root component that handles the lifecycle of the CLI API server process
 */

import EventEmitter from 'eventemitter3'
import { ExecaChildProcess } from 'execa'
import { IS_DEV } from '../configs/constants'
import logger from '../configs/logger'
import { getPort } from '../utils/get-port'
import { killProcess } from '../utils/process'
import { NodeAPIClient } from './api-client'
import { nodeCommands } from './commands'

export interface APIServerEvents {
  ready: [port: number]
  stopped: []
  error: [error: Error]
  restarting: []
}

export class APIServer extends EventEmitter<APIServerEvents> {
  private process: ExecaChildProcess | null = null
  private port: number | null = null
  private _isReady = false
  private isIntentionalStop = false
  private restartTimeout: NodeJS.Timeout | null = null
  private restartAttempts = 0
  private readonly maxRestartAttempts = 5
  private readonly restartDelay = 2000

  constructor() {
    super()
  }

  /**
   * Get the port number
   */
  getPort(): number | null {
    return this.port
  }

  /**
   * Check if the server is ready (started and health check passed)
   */
  isReady(): boolean {
    return this._isReady
  }

  /**
   * Check if the server is running
   */
  isRunning(): boolean {
    return this.process !== null && !this.process.killed
  }

  /**
   * Start the API server
   */
  async start(): Promise<boolean> {
    if (this.process) {
      logger.warn('API server is already running')
      return false
    }

    // Get an available port
    const port = await getPort({ port: [8888] })
    this.port = port
    this.isIntentionalStop = false
    this.restartAttempts = 0
    logger.info(`Starting API server on port ${port}`)

    try {
      // Start the API server process
      this.process = nodeCommands.startApiServer(port)

      // Handle stdout
      this.process.stdout?.on('data', (data: Buffer) => {
        const output = data.toString().trim()
        logger.info(`API Server: ${output}`)
      })

      // Handle stderr
      this.process.stderr?.on('data', (data: Buffer) => {
        const error = data.toString().trim()
        logger.error(`API Server Error: ${error}`)
      })

      // Handle process exit
      this.process.once('exit', (code, signal) => {
        logger.info(`API Server exited with code ${code}, signal ${signal}`)
        this.handleProcessExit()
      })

      // Handle process error
      this.process.once('error', (error) => {
        logger.error('API Server process error:', error)
        this.emit('error', error)
      })

      // Wait for server to be ready
      const isReady = await this.waitForServer()

      if (isReady) {
        this._isReady = true
        logger.info(`API Server is ready on port ${port}`)

        if (IS_DEV) {
          console.log('API Server URL:', `http://127.0.0.1:${port}`)
        }

        this.emit('ready', port)
        return true
      } else {
        throw new Error('API Server failed to start - timeout waiting for health check')
      }
    } catch (error) {
      logger.error('Failed to start API server:', error)
      this.emit('error', error as Error)
      await this.cleanup()
      return false
    }
  }

  /**
   * Stop the API server
   */
  async stop(): Promise<boolean> {
    if (!this.process) {
      logger.info('API server is not running')
      return false
    }

    logger.info('Stopping API server...')
    this.isIntentionalStop = true

    // Clear any pending restart
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }

    try {
      if (this.process.pid) {
        await killProcess(this.process.pid)
        logger.info('API server process killed')
      }
    } catch (error) {
      logger.error('Error killing API server process:', error)
    }

    await this.cleanup()
    this.emit('stopped')
    return true
  }

  /**
   * Restart the API server
   */
  async restart(): Promise<boolean> {
    logger.info('Restarting API server...')
    await this.stop()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await this.start()
  }

  /**
   * Wait for the server to be ready by polling health endpoint
   */
  private async waitForServer(maxRetries = 30, delayMs = 1000): Promise<boolean> {
    if (!this.port) return false

    const tempClient = new NodeAPIClient(this.port)

    for (let i = 0; i < maxRetries; i++) {
      // Check if process is still running
      if (!this.process || this.process.killed) {
        logger.warn('API server process exited while waiting for health check')
        return false
      }

      const isHealthy = await tempClient.health()
      if (isHealthy) {
        return true
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    return false
  }

  /**
   * Handle process exit and auto-restart if needed
   */
  private handleProcessExit() {
    const wasReady = this._isReady
    this.process = null
    this._isReady = false

    // Don't restart if it was an intentional stop
    if (this.isIntentionalStop) {
      logger.info('API server was stopped intentionally')
      this.isIntentionalStop = false
      return
    }

    // Don't restart if we've exceeded max attempts
    if (this.restartAttempts >= this.maxRestartAttempts) {
      logger.error(`API server failed to restart after ${this.maxRestartAttempts} attempts`)
      this.emit('error', new Error(`Max restart attempts (${this.maxRestartAttempts}) exceeded`))
      return
    }

    // Only restart if the server was previously ready (successfully started)
    if (wasReady) {
      this.restartAttempts++
      logger.warn(
        `API server exited unexpectedly. Attempting restart ${this.restartAttempts}/${this.maxRestartAttempts}...`
      )
      this.emit('restarting')

      this.restartTimeout = setTimeout(async () => {
        if (!this.isIntentionalStop) {
          const success = await this.start()
          if (success) {
            logger.info('API server restarted successfully')
            this.restartAttempts = 0 // Reset counter on successful restart
          }
        }
      }, this.restartDelay)
    }
  }

  /**
   * Clean up resources
   */
  private async cleanup() {
    this.process = null
    this.port = null
    this._isReady = false
  }
}

// Export singleton instance
export const apiServer = new APIServer()
