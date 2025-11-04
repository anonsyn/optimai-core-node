import log from '../configs/logger'
import { getErrorMessage } from '../utils/get-error-message'
import { getPort } from '../utils/get-port'
import { sleep } from '../utils/sleep'
import { dockerService } from './docker-service'

export interface Crawl4AiConfig {
  containerName?: string
  imageName?: string
  port?: number
}

const DEFAULT_CONFIG: Required<Crawl4AiConfig> = {
  containerName: 'optimai_crawl4ai_0_7_3',
  imageName: 'unclecode/crawl4ai:0.7.3',
  port: 11235
}

/**
 * Service for managing the Crawl4AI Docker container
 */
export class Crawl4AiService {
  private config: Required<Crawl4AiConfig>
  private containerPort: number | null = null
  private baseUrl: string | null = null
  private initialized: boolean = false

  constructor(config?: Crawl4AiConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Initialize the Crawl4AI service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true
    }

    try {
      // log.info('[crawl4ai] Initializing Crawl4AI service...')

      // Check Docker availability
      if (!(await dockerService.isInstalled())) {
        // log.error('[crawl4ai] Docker is not installed')
        throw new Error('Docker is not installed')
      }

      if (!(await dockerService.isRunning())) {
        // log.error('[crawl4ai] Docker daemon is not running')
        throw new Error('Docker daemon is not running')
      }

      // Check if container already exists and is running
      const containerStatus = await dockerService.getContainerStatus(this.config.containerName)

      if (containerStatus?.status === 'running') {
        // log.info('[crawl4ai] Container is already running')
        // Try to determine the port from existing container
        // For now, we'll use the configured port
        this.containerPort = this.config.port
        this.baseUrl = `http://localhost:${this.containerPort}`

        // Verify it's accessible
        const isHealthy = await this.checkHealth()
        if (isHealthy) {
          this.initialized = true
          return true
        }
      }

      // Get an available port
      this.containerPort = await getPort({ port: this.config.port })
      this.baseUrl = `http://localhost:${this.containerPort}`
      // log.info(`[crawl4ai] Using port ${this.containerPort}`)

      // Pull image if needed
      const imagePulled = await dockerService.pullImage(
        this.config.imageName,
        () => {}
        // log.info(`[crawl4ai] Pull progress: ${message}`)
      )

      if (!imagePulled) {
        // log.error('[crawl4ai] Failed to pull Docker image')
        throw new Error('Failed to pull Docker image')
      }

      // Start or create container
      const started = await this.startContainer()
      if (!started) {
        // log.error('[crawl4ai] Failed to start container')
        return false
      }

      // Wait for container to initialize before checking health
      // log.info('[crawl4ai] Waiting for container to initialize...')
      await sleep(3200)

      // Wait for container to be healthy
      const healthy = await dockerService.waitForHealth(
        this.config.containerName,
        () => this.checkHealth(),
        30,
        2000
      )

      if (!healthy) {
        // log.error('[crawl4ai] Container health check failed')
        return false
      }

      this.initialized = true
      // log.info('[crawl4ai] Service initialized successfully')
      return true
    } catch (error) {
      log.error(
        // '[crawl4ai] Failed to initialize:',
        getErrorMessage(error, 'Failed to initialize Crawl4AI')
      )
      return false
    }
  }

  /**
   * Start the Crawl4AI container
   */
  private async startContainer(): Promise<boolean> {
    const { containerName, imageName } = this.config

    // Check if container exists (stopped)
    const existingContainer = await dockerService.getContainerStatus(containerName)

    if (existingContainer) {
      // Container exists, try to start it
      if (existingContainer.status !== 'running') {
        // log.info(`[crawl4ai] Starting existing container ${containerName}...`)
        return await dockerService.startContainer(containerName)
      }
      return true
    }

    // Create and run new container
    // log.info(`[crawl4ai] Creating new container ${containerName}...`)
    const containerId = await dockerService.runContainer({
      name: containerName,
      image: imageName,
      port: {
        host: this.containerPort!,
        container: 11235
      },
      restart: 'unless-stopped',
      detached: true,
      shmSize: '1g'
    })

    return containerId !== null
  }

  /**
   * Check if the Crawl4AI service is healthy
   */
  async checkHealth(): Promise<boolean> {
    if (!this.baseUrl) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get the base URL for the Crawl4AI API
   */
  getBaseUrl(): string | null {
    return this.baseUrl
  }

  /**
   * Get the container port
   */
  getPort(): number | null {
    return this.containerPort
  }

  /**
   * Get the container name
   */
  getContainerName(): string {
    return this.config.containerName
  }

  /**
   * Check if the container is running
   */
  async isContainerRunning(): Promise<boolean> {
    return await dockerService.isContainerRunning(this.config.containerName)
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Stop the Crawl4AI container
   */
  async stop(): Promise<boolean> {
    try {
      // log.info('[crawl4ai] Stopping container...')
      const stopped = await dockerService.stopContainer(this.config.containerName)
      if (stopped) {
        this.initialized = false
        this.baseUrl = null
        this.containerPort = null
      }
      return stopped
    } catch (error) {
      log.error(
        // '[crawl4ai] Failed to stop container:',
        getErrorMessage(error, 'Failed to stop Crawl4AI container')
      )
      return false
    }
  }

  /**
   * Remove the Crawl4AI container
   */
  async remove(): Promise<boolean> {
    try {
      // log.info('[crawl4ai] Removing container...')

      // Stop first if running
      await this.stop()

      const removed = await dockerService.removeContainer(this.config.containerName, true)
      return removed
    } catch (error) {
      log.error(
        // '[crawl4ai] Failed to remove container:',
        getErrorMessage(error, 'Failed to remove Crawl4AI container')
      )
      return false
    }
  }

  /**
   * Get container logs
   */
  async getLogs(lines: number = 50): Promise<string> {
    return dockerService.getLogs(this.config.containerName, { tail: lines })
  }

  /**
   * Cleanup resources (but keep container running)
   */
  async cleanup(): Promise<void> {
    // We don't stop the container on cleanup, just reset the state
    // This allows the container to be reused
    this.initialized = false
    // log.info('[crawl4ai] Service cleaned up (container still running for reuse)')
  }
}

// Export singleton instance
export const crawl4AiService = new Crawl4AiService()
