import os from 'node:os'
import path from 'node:path'

import execa from 'execa'
import log from '../../configs/logger'
import { dockerNotInstalledError, dockerNotRunningError } from '../../errors/error-factory'
import { getErrorMessage } from '../../utils/get-error-message'
import { ensureError } from '../../utils/ensure-error'

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
  shmSize?: string
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
  private dockerResolutionCache: { command: string; version: string } | null = null
  private dockerResolutionPromise: Promise<{ command: string; version: string }> | null = null

  /**
   * Check if Docker is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      const { version } = await this.ensureDockerBinary()
      console.info('[docker] Docker version:', version)
      return true
    } catch (error) {
      console.error(
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
      const docker = await this.getDockerCommand()
      await execa(docker, ['info'])
      return true
    } catch (error) {
      console.error(
        '[docker] Docker daemon not running:',
        getErrorMessage(error, 'Docker daemon not running')
      )
      return false
    }
  }

  async ensureAvailability() {
    try {
      const installed = await this.isInstalled()
      if (!installed) {
        throw ensureError(dockerNotInstalledError())
      }

      const running = await this.isRunning()
      if (!running) {
        throw ensureError(dockerNotRunningError())
      }
    } catch (error) {
      log.error("[mining] Couldn't check Docker:", getErrorMessage(error, "Couldn't check Docker"))
      throw ensureError(error, "Couldn't check Docker")
    }
  }

  async isAvailable() {
    try {
      await this.ensureAvailability()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get Docker information
   */
  async getInfo(): Promise<DockerInfo | null> {
    try {
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, ['version', '--format', 'json'])
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
  async pullImage(image: string, onProgress?: (message: string) => void) {
    try {
      // Check if image exists locally first
      const exists = await this.isImageExists(image)
      if (exists) {
        log.debug(`[docker] Image ${image} already exists locally`)
        return
      }

      log.debug(`[docker] Pulling image ${image}...`)
      onProgress?.(`Pulling ${image}...`)

      const docker = await this.getDockerCommand()
      const pullProcess = execa(docker, ['pull', image])

      if (pullProcess.stdout) {
        pullProcess.stdout.on('data', (data) => {
          const message = data.toString().trim()
          if (message) {
            log.debug(`[docker] Pull progress: ${message}`)
            onProgress?.(message)
          }
        })
      }

      await pullProcess
      log.debug(`[docker] Image ${image} pulled successfully`)
      onProgress?.('Pull complete')
    } catch (error) {
      log.error(
        `[docker] Failed to pull image ${image}:`,
        getErrorMessage(error, `Failed to pull image ${image}`)
      )
      throw error
    }
  }

  /**
   * Check if an image exists locally
   */
  async isImageExists(image: string): Promise<boolean> {
    try {
      const docker = await this.getDockerCommand()
      await execa(docker, ['image', 'inspect', image])
      return true
    } catch {
      return false
    }
  }

  /**
   * Create and run a container
   */
  async runContainer(config: ContainerConfig): Promise<string> {
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

      if (config.shmSize) {
        args.push('--shm-size', config.shmSize)
      }

      args.push(config.image)

      if (config.command) {
        args.push(...config.command)
      }

      log.debug(`[docker] Running container ${config.name}...`)
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, args)
      const containerId = stdout.trim().substring(0, 12)
      log.debug(`[docker] Container ${config.name} started with ID: ${containerId}`)
      return containerId
    } catch (error) {
      log.error(
        `[docker] Failed to run container ${config.name}:`,
        getErrorMessage(error, `Failed to run container ${config.name}`)
      )
      throw error
    }
  }

  /**
   * Start an existing container
   */
  async startContainer(name: string): Promise<void> {
    try {
      log.debug(`[docker] Starting container ${name}...`)
      const docker = await this.getDockerCommand()
      await execa(docker, ['start', name])
      log.debug(`[docker] Container ${name} started`)
    } catch (error) {
      log.error(
        `[docker] Failed to start container ${name}:`,
        getErrorMessage(error, `Failed to start container ${name}`)
      )
      throw error
    }
  }

  /**
   * Restart a container
   */
  async restartContainer(name: string): Promise<void> {
    try {
      log.debug(`[docker] Restarting container ${name}...`)
      const docker = await this.getDockerCommand()
      await execa(docker, ['restart', name])
      log.debug(`[docker] Container ${name} restarted`)
    } catch (error) {
      log.error(
        `[docker] Failed to restart container ${name}:`,
        getErrorMessage(error, `Failed to restart container ${name}`)
      )
      throw error
    }
  }

  /**
   * Stop a running container
   */
  async stopContainer(name: string, timeout?: number) {
    try {
      log.debug(`[docker] Stopping container ${name}...`)
      const args = ['stop']
      if (timeout !== undefined) {
        args.push('-t', timeout.toString())
      }
      args.push(name)

      const docker = await this.getDockerCommand()
      await execa(docker, args)
      log.debug(`[docker] Container ${name} stopped`)
    } catch (error) {
      log.error(
        `[docker] Failed to stop container ${name}:`,
        getErrorMessage(error, `Failed to stop container ${name}`)
      )
      throw error
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(name: string, force?: boolean) {
    try {
      log.debug(`[docker] Removing container ${name}...`)
      const args = ['rm']
      if (force) {
        args.push('-f')
      }
      args.push(name)

      const docker = await this.getDockerCommand()
      await execa(docker, args)
      log.debug(`[docker] Container ${name} removed`)
    } catch (error) {
      log.error(
        `[docker] Failed to remove container ${name}:`,
        getErrorMessage(error, `Failed to remove container ${name}`)
      )
      throw error
    }
  }

  /**
   * Get container status
   */
  async getContainerStatus(name: string): Promise<ContainerInfo | null> {
    try {
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, [
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
  async exec(
    container: string,
    command: string[]
  ): Promise<{ stdout: string; stderr: string } | null> {
    try {
      const docker = await this.getDockerCommand()
      const result = await execa(docker, ['exec', container, ...command])
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

      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, args)
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

      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, args)
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
  ) {
    for (let i = 0; i < maxRetries; i++) {
      // First check if container is running
      const isRunning = await this.isContainerRunning(name)
      if (!isRunning) {
        log.warn(`[docker] Container ${name} is not running`)
        throw new Error(`Container ${name} is not running`)
      }

      // Then check health
      const isHealthy = await healthCheckFn()
      if (isHealthy) {
        log.debug(`[docker] Container ${name} is healthy`)
        return
      }

      if (i < maxRetries - 1) {
        log.debug(
          `[docker] Waiting for container ${name} to be healthy... (${i + 1}/${maxRetries})`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }

    log.error(`[docker] Container ${name} health check failed after ${maxRetries} attempts`)
    throw new Error(`Container ${name} health check failed after ${maxRetries} attempts`)
  }

  /**
   * Ensure we have a usable Docker binary and cache the resolution
   */
  private async ensureDockerBinary(): Promise<{ command: string; version: string }> {
    if (this.dockerResolutionCache) {
      return this.dockerResolutionCache
    }

    if (!this.dockerResolutionPromise) {
      this.dockerResolutionPromise = this.resolveDockerBinary()
    }

    try {
      const result = await this.dockerResolutionPromise
      this.dockerResolutionCache = result

      if (!process.env.DOCKER_PATH && path.isAbsolute(result.command)) {
        process.env.DOCKER_PATH = result.command
      }

      return result
    } finally {
      this.dockerResolutionPromise = null
    }
  }

  /**
   * Retrieve the resolved Docker command path
   */
  private async getDockerCommand(): Promise<string> {
    const { command } = await this.ensureDockerBinary()
    return command
  }

  /**
   * Attempt to locate the Docker CLI across PATH and common install locations
   */
  private async resolveDockerBinary(): Promise<{ command: string; version: string }> {
    const candidates = this.getDockerCandidates()

    for (const candidate of candidates) {
      const trimmedCandidate = candidate.trim()
      if (!trimmedCandidate) {
        continue
      }

      try {
        const { stdout } = await execa(trimmedCandidate, ['--version'])
        const version = stdout.trim()
        log.debug(`[docker] Using Docker CLI at: ${trimmedCandidate}`)
        return { command: trimmedCandidate, version }
      } catch (error) {
        const code = (error as NodeJS.ErrnoException | undefined)?.code

        if (code === 'ENOENT' || code === 'EACCES' || code === 'UNKNOWN') {
          continue
        }

        log.debug(
          `[docker] Candidate ${trimmedCandidate} failed validation:`,
          getErrorMessage(error, 'Candidate validation failed')
        )
      }
    }

    throw new Error(
      'Docker CLI not found. Ensure Docker Desktop is installed or set DOCKER_PATH to the Docker binary.'
    )
  }

  /**
   * Build the ordered list of Docker binary candidates to test
   */
  private getDockerCandidates(): string[] {
    const candidates = new Set<string>()
    const binaryNames = this.getBinaryNames()

    binaryNames.forEach((name) => candidates.add(name))

    const configuredPath = process.env.DOCKER_PATH?.trim()
    if (configuredPath) {
      if (this.looksLikeBinaryPath(configuredPath, binaryNames)) {
        candidates.add(configuredPath)
      } else {
        binaryNames.forEach((name) => candidates.add(path.join(configuredPath, name)))
      }
    }

    const pathEntries = process.env.PATH?.split(path.delimiter) ?? []
    for (const entry of pathEntries) {
      const trimmedEntry = entry.trim()
      if (!trimmedEntry) {
        continue
      }

      binaryNames.forEach((name) => candidates.add(path.join(trimmedEntry, name)))
    }

    for (const dir of this.getPlatformSpecificDirectories()) {
      binaryNames.forEach((name) => candidates.add(path.join(dir, name)))
    }

    return Array.from(candidates)
  }

  /**
   * Candidate binary names for the current platform
   */
  private getBinaryNames(): string[] {
    if (process.platform === 'win32') {
      return ['docker.exe', 'com.docker.cli.exe']
    }

    return ['docker', 'com.docker.cli']
  }

  /**
   * Additional directories to probe for the Docker CLI based on platform defaults
   */
  private getPlatformSpecificDirectories(): string[] {
    if (process.platform === 'darwin') {
      return [
        '/usr/local/bin',
        '/opt/homebrew/bin',
        '/opt/local/bin',
        '/Applications/Docker.app/Contents/Resources/bin',
        path.join(os.homedir(), '.docker', 'bin')
      ]
    }

    if (process.platform === 'win32') {
      const directories = new Set<string>()
      const programFilesRoots = [
        process.env.ProgramFiles,
        process.env['ProgramFiles(x86)'],
        process.env.ProgramW6432
      ].filter((value): value is string => Boolean(value))

      for (const root of programFilesRoots) {
        directories.add(path.join(root, 'Docker', 'Docker', 'resources'))
        directories.add(path.join(root, 'Docker', 'Docker', 'resources', 'bin'))
      }

      if (process.env.LOCALAPPDATA) {
        directories.add(
          path.join(process.env.LOCALAPPDATA, 'Programs', 'Docker', 'Docker', 'resources')
        )
        directories.add(
          path.join(process.env.LOCALAPPDATA, 'Programs', 'Docker', 'Docker', 'resources', 'bin')
        )
      }

      return Array.from(directories)
    }

    return ['/usr/bin', '/usr/local/bin', '/snap/bin', '/bin', '/usr/sbin']
  }

  /**
   * Determine if the provided path already looks like a binary path
   */
  private looksLikeBinaryPath(candidate: string, binaryNames: string[]): boolean {
    const lowerCandidate = candidate.toLowerCase()
    return binaryNames.some((name) => lowerCandidate.endsWith(name.toLowerCase()))
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
