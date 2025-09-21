import { exec } from 'child_process'
import log from 'electron-log/main'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface DockerConfig {
  imageName: string
  containerName: string
  port: number
}

const DEFAULT_CONFIG: DockerConfig = {
  imageName: 'unclecode/crawl4ai:basic',
  containerName: 'crawl4ai',
  port: 8080
}

export class DockerManager {
  private config: DockerConfig

  constructor(config?: Partial<DockerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if Docker is available on the system
   */
  async isDockerAvailable(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('docker --version')
      log.info('Docker version:', stdout.trim())
      return true
    } catch (error) {
      log.error('Docker not available:', error)
      return false
    }
  }

  /**
   * Check if Docker daemon is running
   */
  async isDockerRunning(): Promise<boolean> {
    try {
      await execAsync('docker info')
      return true
    } catch (error) {
      log.error('Docker daemon not running:', error)
      return false
    }
  }

  /**
   * Check if a container is running
   */
  async isContainerRunning(containerName?: string): Promise<boolean> {
    const name = containerName || this.config.containerName
    try {
      const { stdout } = await execAsync(`docker ps --filter "name=${name}" --format "{{.Names}}"`)
      return stdout.trim() === name
    } catch (error) {
      log.error('Error checking container status:', error)
      return false
    }
  }

  /**
   * Pull Docker image if not present
   */
  async pullImage(imageName?: string): Promise<boolean> {
    const image = imageName || this.config.imageName
    try {
      log.info(`Pulling Docker image ${image}...`)

      // Check if image exists locally first
      try {
        await execAsync(`docker image inspect ${image}`)
        log.info(`Image ${image} already exists locally`)
        return true
      } catch {
        // Image doesn't exist, proceed with pull
      }

      // Pull the image
      const { stderr } = await execAsync(`docker pull ${image}`, {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large pulls
      })

      if (stderr && !stderr.includes('Downloaded') && !stderr.includes('Pull complete')) {
        log.error('Docker pull stderr:', stderr)
        return false
      }

      log.info('Docker image pulled successfully')
      return true
    } catch (error) {
      log.error('Failed to pull Docker image:', error)
      return false
    }
  }

  /**
   * Start the crawler container
   */
  async startContainer(): Promise<boolean> {
    const { containerName, imageName, port } = this.config

    try {
      // Check if container already exists (stopped)
      try {
        const { stdout } = await execAsync(
          `docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`
        )

        if (stdout.trim() === containerName) {
          // Container exists, try to start it
          log.info(`Starting existing container ${containerName}...`)
          await execAsync(`docker start ${containerName}`)
          log.info(`Container ${containerName} started`)
          return true
        }
      } catch {
        // Container doesn't exist, proceed with creation
      }

      // Create and run new container
      log.info(`Creating and starting container ${containerName}...`)

      const dockerCommand = [
        'docker',
        'run',
        '-d',
        '--name',
        containerName,
        '-p',
        `${port}:80`,
        '--restart',
        'unless-stopped',
        imageName
      ]

      const { stdout, stderr } = await execAsync(dockerCommand.join(' '))

      if (stderr && !stderr.includes('WARNING')) {
        log.error('Docker run stderr:', stderr)
        return false
      }

      log.info(`Container ${containerName} started with ID: ${stdout.trim().substring(0, 12)}`)
      return true
    } catch (error) {
      log.error('Failed to start container:', error)
      return false
    }
  }

  /**
   * Stop the crawler container
   */
  async stopContainer(containerName?: string): Promise<boolean> {
    const name = containerName || this.config.containerName

    try {
      log.info(`Stopping container ${name}...`)
      await execAsync(`docker stop ${name}`)
      log.info(`Container ${name} stopped`)
      return true
    } catch (error) {
      log.error('Failed to stop container:', error)
      return false
    }
  }

  /**
   * Remove the crawler container
   */
  async removeContainer(containerName?: string): Promise<boolean> {
    const name = containerName || this.config.containerName

    try {
      log.info(`Removing container ${name}...`)
      await execAsync(`docker rm -f ${name}`)
      log.info(`Container ${name} removed`)
      return true
    } catch (error) {
      log.error('Failed to remove container:', error)
      return false
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(lines: number = 50): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs --tail ${lines} ${this.config.containerName}`)
      return stdout
    } catch (error) {
      log.error('Failed to get container logs:', error)
      return ''
    }
  }

  /**
   * Initialize Docker environment for crawler
   */
  async initialize(): Promise<boolean> {
    try {
      // Check Docker availability
      if (!(await this.isDockerAvailable())) {
        log.error('Docker is not installed')
        return false
      }

      // Check Docker daemon
      if (!(await this.isDockerRunning())) {
        log.error('Docker daemon is not running')
        return false
      }

      // Check if container is already running
      if (await this.isContainerRunning()) {
        log.info('Crawler container is already running')
        return true
      }

      // Pull image if needed
      if (!(await this.pullImage())) {
        log.error('Failed to pull Docker image')
        return false
      }

      // Start container
      if (!(await this.startContainer())) {
        log.error('Failed to start container')
        return false
      }

      // Wait for container to be ready
      return await this.waitForContainer()
    } catch (error) {
      log.error('Failed to initialize Docker environment:', error)
      return false
    }
  }

  /**
   * Wait for container to be ready
   */
  private async waitForContainer(
    maxRetries: number = 30,
    delayMs: number = 2000
  ): Promise<boolean> {
    const healthUrl = `http://localhost:${this.config.port}/health`

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        })

        if (response.ok) {
          log.info('Crawler container is healthy')
          return true
        }
      } catch (error) {
        log.error('Container health check failed:', error)
        // Container not ready yet
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    log.error('Container health check failed after maximum retries')
    return false
  }

  /**
   * Cleanup Docker resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopContainer()
      // Optionally remove container
      // await this.removeContainer()
    } catch (error) {
      log.error('Error during cleanup:', error)
    }
  }
}

// Singleton instance
export const dockerManager = new DockerManager()
