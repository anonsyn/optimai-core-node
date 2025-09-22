import log from 'electron-log/main'
import execa from 'execa'
import { getErrorMessage } from '../utils/get-error-message'

export interface ContainerConfig {
  name: string
  image: string
  port?: { host: number; container: number }
  env?: Record<string, string>
  volumes?: Array<{ host: string; container: string }>
  restart?: 'no' | 'always' | 'unless-stopped' | 'on-failure'
  command?: string[]
  network?: string
  detached?: boolean
}

export interface DockerInfo {
  version?: string
  serverVersion?: string
  apiVersion?: string
}

export interface ContainerInfo {
  id?: string
  name: string
  image: string
  status: 'running' | 'exited' | 'created' | 'paused' | 'unknown'
  ports?: string[]
}

/**
 * Generic Docker service for managing containers
 */
export class DockerService {
  /**
   * Check if Docker is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execa('docker', ['--version'])
      log.info('[docker] Docker version:', stdout.trim())
      return true
    } catch (error) {
      log.error(
        '[docker] Docker not installed:',
        getErrorMessage(error, 'Docker not installed')
      )
      return false
    }
  }

  /**
   * Check if Docker daemon is running
   */
  async isRunning(): Promise<boolean> {
    try {
      await execa('docker', ['info'])
      return true
    } catch (error) {
      log.error(
        '[docker] Docker daemon not running:',
        getErrorMessage(error, 'Docker daemon not running')
      )
      return false
    }
  }

  /**
   * Get Docker information
   */
  async getInfo(): Promise<DockerInfo | null> {
    try {
      const { stdout } = await execa('docker', ['version', '--format', 'json'])
      const info = JSON.parse(stdout)
      return {
        version: info.Client?.Version,
        serverVersion: info.Server?.Version,
        apiVersion: info.Server?.ApiVersion
      }
    } catch (error) {
      log.error(
        '[docker] Failed to get Docker info:',
        getErrorMessage(error, 'Failed to get Docker info')
      )
      return null
    }
  }

  /**
   * Pull a Docker image
   */
  async pullImage(image: string, onProgress?: (message: string) => void): Promise<boolean> {
    try {
      // Check if image exists locally first
      const exists = await this.imageExists(image)
      if (exists) {
        log.info(`[docker] Image ${image} already exists locally`)
        return true
      }

      log.info(`[docker] Pulling image ${image}...`)
      onProgress?.(`Pulling ${image}...`)

      const pullProcess = execa('docker', ['pull', image])

      if (pullProcess.stdout) {
        pullProcess.stdout.on('data', (data) => {
          const message = data.toString().trim()
          if (message) {
            log.info(`[docker] Pull progress: ${message}`)
            onProgress?.(message)
          }
        })
      }

      await pullProcess
      log.info(`[docker] Image ${image} pulled successfully`)
      onProgress?.('Pull complete')
      return true
    } catch (error) {
      log.error(
        `[docker] Failed to pull image ${image}:`,
        getErrorMessage(error, `Failed to pull image ${image}`)
      )
      return false
    }
  }

  /**
   * Check if an image exists locally
   */
  async imageExists(image: string): Promise<boolean> {
    try {
      await execa('docker', ['image', 'inspect', image])
      return true
    } catch {
      return false
    }
  }

  /**
   * Create and run a container
   */
  async runContainer(config: ContainerConfig): Promise<string | null> {
    try {
      const args = ['run']

      if (config.detached !== false) {
        args.push('-d')
      }

      args.push('--name', config.name)

      if (config.port) {
        args.push('-p', `${config.port.host}:${config.port.container}`)
      }

      if (config.env) {
        Object.entries(config.env).forEach(([key, value]) => {
          args.push('-e', `${key}=${value}`)
        })
      }

      if (config.volumes) {
        config.volumes.forEach((volume) => {
          args.push('-v', `${volume.host}:${volume.container}`)
        })
      }

      if (config.restart) {
        args.push('--restart', config.restart)
      }

      if (config.network) {
        args.push('--network', config.network)
      }

      args.push(config.image)

      if (config.command) {
        args.push(...config.command)
      }

      log.info(`[docker] Running container ${config.name}...`)
      const { stdout } = await execa('docker', args)
      const containerId = stdout.trim().substring(0, 12)
      log.info(`[docker] Container ${config.name} started with ID: ${containerId}`)
      return containerId
    } catch (error) {
      log.error(
        `[docker] Failed to run container ${config.name}:`,
        getErrorMessage(error, `Failed to run container ${config.name}`)
      )
      return null
    }
  }

  /**
   * Start an existing container
   */
  async startContainer(name: string): Promise<boolean> {
    try {
      log.info(`[docker] Starting container ${name}...`)
      await execa('docker', ['start', name])
      log.info(`[docker] Container ${name} started`)
      return true
    } catch (error) {
      log.error(
        `[docker] Failed to start container ${name}:`,
        getErrorMessage(error, `Failed to start container ${name}`)
      )
      return false
    }
  }

  /**
   * Stop a running container
   */
  async stopContainer(name: string, timeout?: number): Promise<boolean> {
    try {
      log.info(`[docker] Stopping container ${name}...`)
      const args = ['stop']
      if (timeout !== undefined) {
        args.push('-t', timeout.toString())
      }
      args.push(name)

      await execa('docker', args)
      log.info(`[docker] Container ${name} stopped`)
      return true
    } catch (error) {
      log.error(
        `[docker] Failed to stop container ${name}:`,
        getErrorMessage(error, `Failed to stop container ${name}`)
      )
      return false
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(name: string, force?: boolean): Promise<boolean> {
    try {
      log.info(`[docker] Removing container ${name}...`)
      const args = ['rm']
      if (force) {
        args.push('-f')
      }
      args.push(name)

      await execa('docker', args)
      log.info(`[docker] Container ${name} removed`)
      return true
    } catch (error) {
      log.error(
        `[docker] Failed to remove container ${name}:`,
        getErrorMessage(error, `Failed to remove container ${name}`)
      )
      return false
    }
  }

  /**
   * Get container status
   */
  async getContainerStatus(name: string): Promise<ContainerInfo | null> {
    try {
      const { stdout } = await execa('docker', [
        'ps',
        '-a',
        '--filter',
        `name=^${name}$`,
        '--format',
        '{{json .}}'
      ])

      if (!stdout) {
        return null
      }

      const info = JSON.parse(stdout)
      return {
        id: info.ID,
        name: info.Names,
        image: info.Image,
        status: this.parseContainerStatus(info.Status),
        ports: info.Ports ? [info.Ports] : []
      }
    } catch (error) {
      log.error(
        `[docker] Failed to get container status for ${name}:`,
        getErrorMessage(error, `Failed to get container status for ${name}`)
      )
      return null
    }
  }

  /**
   * Check if container is running
   */
  async isContainerRunning(name: string): Promise<boolean> {
    const status = await this.getContainerStatus(name)
    return status?.status === 'running'
  }

  /**
   * Execute a command in a running container
   */
  async exec(container: string, command: string[]): Promise<{ stdout: string; stderr: string } | null> {
    try {
      const result = await execa('docker', ['exec', container, ...command])
      return {
        stdout: result.stdout,
        stderr: result.stderr
      }
    } catch (error) {
      log.error(
        `[docker] Failed to exec in container ${container}:`,
        getErrorMessage(error, `Failed to exec in container ${container}`)
      )
      return null
    }
  }

  /**
   * Get container logs
   */
  async getLogs(name: string, options?: { tail?: number; follow?: boolean }): Promise<string> {
    try {
      const args = ['logs']
      if (options?.tail !== undefined) {
        args.push('--tail', options.tail.toString())
      }
      if (options?.follow) {
        args.push('-f')
      }
      args.push(name)

      const { stdout } = await execa('docker', args)
      return stdout
    } catch (error) {
      log.error(
        `[docker] Failed to get logs for ${name}:`,
        getErrorMessage(error, `Failed to get logs for ${name}`)
      )
      return ''
    }
  }

  /**
   * List all containers
   */
  async listContainers(all?: boolean): Promise<ContainerInfo[]> {
    try {
      const args = ['ps', '--format', '{{json .}}']
      if (all) {
        args.splice(1, 0, '-a')
      }

      const { stdout } = await execa('docker', args)
      if (!stdout) {
        return []
      }

      const lines = stdout.trim().split('\n')
      return lines.map((line) => {
        const info = JSON.parse(line)
        return {
          id: info.ID,
          name: info.Names,
          image: info.Image,
          status: this.parseContainerStatus(info.Status),
          ports: info.Ports ? [info.Ports] : []
        }
      })
    } catch (error) {
      log.error(
        '[docker] Failed to list containers:',
        getErrorMessage(error, 'Failed to list containers')
      )
      return []
    }
  }

  /**
   * Wait for container to be healthy
   */
  async waitForHealth(
    name: string,
    healthCheckFn: () => Promise<boolean>,
    maxRetries: number = 30,
    delayMs: number = 2000
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      // First check if container is running
      const isRunning = await this.isContainerRunning(name)
      if (!isRunning) {
        log.warn(`[docker] Container ${name} is not running`)
        return false
      }

      // Then check health
      const isHealthy = await healthCheckFn()
      if (isHealthy) {
        log.info(`[docker] Container ${name} is healthy`)
        return true
      }

      if (i < maxRetries - 1) {
        log.info(`[docker] Waiting for container ${name} to be healthy... (${i + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    log.error(`[docker] Container ${name} health check failed after ${maxRetries} attempts`)
    return false
  }

  /**
   * Parse container status string
   */
  private parseContainerStatus(status: string): ContainerInfo['status'] {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('up')) return 'running'
    if (statusLower.includes('exited')) return 'exited'
    if (statusLower.includes('created')) return 'created'
    if (statusLower.includes('paused')) return 'paused'
    return 'unknown'
  }
}

// Export singleton instance
export const dockerService = new DockerService()
