import log from '../../configs/logger'
import { getErrorMessage } from '../../utils/get-error-message'
import { getPort } from '../../utils/get-port'
import { ensureError } from '../../utils/ensure-error'
import { sleep } from '../../utils/sleep'
import { dockerService } from '.././docker/docker-service'

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
  async initialize() {
    if (this.initialized) {
      return
    }

    try {
      // Check Docker availability
      await dockerService.ensureAvailability()

      // Check if container already exists and is running
      const existingContainer = await dockerService.getContainerStatus(this.config.containerName)
      const isContainerRunning = existingContainer?.status === 'running'

      if (isContainerRunning) {
        const resolvedPort =
          this.resolveHostPort(existingContainer?.ports, 11235) ?? this.config.port
        this.containerPort = resolvedPort
        this.baseUrl = `http://127.0.0.1:${resolvedPort}`

        // Verify it's accessible
        const isHealthy = await this.checkHealth()
        if (isHealthy) {
          this.initialized = true
          return
        }
      }

      // Get an available port
      this.containerPort = await getPort({ port: this.config.port })
      this.baseUrl = `http://127.0.0.1:${this.containerPort}`

      // Pull image if needed
      await dockerService.pullImage(this.config.imageName, () => {})

      // Start or create container
      await this.startContainer()

      // Wait for container to initialize before checking health
      await sleep(3200)

      // Wait for container to be healthy
      await dockerService.waitForHealth(
        this.config.containerName,
        () => this.checkHealth(),
        30,
        2000
      )

      this.initialized = true
    } catch (error) {
      log.error(getErrorMessage(error, 'Failed to initialize Crawl4AI'))
      throw ensureError(error, 'Failed to initialize Crawl4AI')
    }
  }

  private resolveHostPort(ports: string[] | undefined, containerPort: number): number | null {
    if (!ports || ports.length === 0) {
      return null
    }

    const re = new RegExp(`(\\\\d+)->${containerPort}\\\\/tcp`)
    for (const entry of ports) {
      for (const part of entry.split(',').map((segment) => segment.trim())) {
        const match = part.match(re)
        if (match?.[1]) {
          const parsed = Number(match[1])
          if (Number.isFinite(parsed) && parsed > 0) {
            return parsed
          }
        }
      }
    }

    return null
  }

  /**
   * Start the Crawl4AI container
   */
  private async startContainer(): Promise<void> {
    const { containerName, imageName } = this.config

    // Check if container exists (stopped)
    const existingContainer = await dockerService.getContainerStatus(containerName)

    if (existingContainer) {
      // Container exists, try to start it
      if (existingContainer.status !== 'running') {
        await dockerService.startContainer(containerName)
      }

      // Ensure we use the container's actual published port mapping
      const resolvedPort = this.resolveHostPort(existingContainer.ports, 11235)
      if (resolvedPort) {
        this.containerPort = resolvedPort
        this.baseUrl = `http://127.0.0.1:${resolvedPort}`
      }
      return
    }

    // Create and run new container
    await dockerService.runContainer({
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
  }

  /**
   * Check if the Crawl4AI service is healthy
   */
  async checkHealth(): Promise<boolean> {
    if (!this.baseUrl) {
      return false
    }

    try {
      // Some deployments may not expose `/health` reliably (404/slow), while the API is usable.
      // Try a small set of endpoints and accept any 2xx/3xx response.
      const endpoints = ['/health', '/openapi.json', '/docs', '/']

      for (const path of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${path}`, {
            signal: AbortSignal.timeout(5000)
          })

          if (response.status >= 200 && response.status < 400) {
            return true
          }
        } catch {
          // try next endpoint
        }
      }

      return false
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

  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Stop the Crawl4AI container
   */
  async stop() {
    try {
      await dockerService.stopContainer(this.config.containerName)
      this.initialized = false
      this.baseUrl = null
      this.containerPort = null
    } catch (error) {
      log.error(getErrorMessage(error, 'Failed to stop Crawl4AI container'))
    }
  }

  /**
   * Restart the Crawl4AI container (attempts restart, fallback to start)
   */
  async restartContainer(): Promise<void> {
    try {
      await dockerService.ensureAvailability()

      const status = await dockerService.getContainerStatus(this.config.containerName)

      if (status) {
        const resolvedPort =
          this.resolveHostPort(status.ports, 11235) ?? this.containerPort ?? this.config.port
        this.containerPort = resolvedPort
        this.baseUrl = `http://127.0.0.1:${resolvedPort}`

        try {
          await dockerService.restartContainer(this.config.containerName)
        } catch (error) {
          const message = getErrorMessage(
            error,
            `Failed to restart Crawl4AI container ${this.config.containerName}`
          )
          log.warn(`[crawl4ai] ${message}; attempting fresh start`)
          await this.startContainer()
        }

        const refreshed = await dockerService.getContainerStatus(this.config.containerName)
        const refreshedPort = this.resolveHostPort(refreshed?.ports, 11235)
        if (refreshedPort) {
          this.containerPort = refreshedPort
          this.baseUrl = `http://127.0.0.1:${refreshedPort}`
        }
      } else {
        this.containerPort = await getPort({ port: this.config.port })
        this.baseUrl = `http://127.0.0.1:${this.containerPort}`
        await this.startContainer()
      }

      await sleep(3200)
      await dockerService.waitForHealth(
        this.config.containerName,
        () => this.checkHealth(),
        30,
        2000
      )

      this.initialized = true
    } catch (error) {
      this.initialized = false
      log.error(getErrorMessage(error, 'Failed to restart Crawl4AI container'))
      throw ensureError(error, 'Failed to restart Crawl4AI container')
    }
  }

  /**
   * Check whether the container is running
   */
  async isContainerRunning(): Promise<boolean> {
    try {
      return await dockerService.isContainerRunning(this.config.containerName)
    } catch (error) {
      log.error(getErrorMessage(error, 'Failed to check Crawl4AI container status'))
      return false
    }
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
