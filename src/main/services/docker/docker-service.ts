import os from 'node:os'
import path from 'node:path'

import execa from 'execa'
import log from '../../configs/logger'
import {
  dockerContainerNotRunningError,
  dockerHealthCheckFailedError,
  dockerNotInstalledError,
  dockerNotRunningError
} from '../../errors/error-factory'
import { ensureError } from '../../utils/ensure-error'
import { getErrorMessage } from '../../utils/get-error-message'

function parseDockerHumanSizeToBytes(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (trimmed === '0B') return 0

  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(B|kB|KB|MB|MiB|GB|GiB|TB|TiB)$/)
  if (!match) return null

  const value = Number(match[1])
  if (!Number.isFinite(value)) return null

  const unit = match[2]
  const powerTable: Record<string, number> = {
    B: 0,
    kB: 1,
    KB: 1,
    MB: 2,
    MiB: 2,
    GB: 3,
    GiB: 3,
    TB: 4,
    TiB: 4
  }
  const power = powerTable[unit]
  if (power === undefined) return null

  return Math.round(value * 1024 ** power)
}

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

  private async getContainerStateSummary(name: string): Promise<Record<string, unknown> | null> {
    try {
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, ['inspect', name, '--format', '{{json .State}}'])
      const trimmed = stdout.trim()
      if (!trimmed || trimmed === 'null') {
        return null
      }

      const state = JSON.parse(trimmed)
      const health = state?.Health
      return {
        status: state?.Status,
        healthStatus: health?.Status,
        healthFailingStreak: health?.FailingStreak,
        exitCode: state?.ExitCode,
        oomKilled: state?.OOMKilled,
        error: state?.Error,
        startedAt: state?.StartedAt,
        finishedAt: state?.FinishedAt
      }
    } catch (error) {
      log.debug(
        `[docker] Failed to inspect state for ${name}:`,
        getErrorMessage(error, 'Failed to inspect container state')
      )
      return null
    }
  }

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
   * Get a human-readable disk usage report for Docker resources.
   * Note: output depends on Docker CLI version and platform.
   */
  async getDiskUsageReport(verbose: boolean = true): Promise<string | null> {
    try {
      const docker = await this.getDockerCommand()
      const args = verbose ? ['system', 'df', '-v'] : ['system', 'df']
      const { stdout } = await execa(docker, args)
      return stdout.trim() || null
    } catch (error) {
      log.debug(
        '[docker] Failed to get disk usage report:',
        getErrorMessage(error, 'Failed to get disk usage report')
      )
      return null
    }
  }

  private parseImageRef(imageRef: string): { repository: string; tag: string } | null {
    const trimmed = imageRef.trim()
    if (!trimmed) return null

    const lastColon = trimmed.lastIndexOf(':')
    if (lastColon === -1) {
      return { repository: trimmed, tag: 'latest' }
    }

    const repository = trimmed.slice(0, lastColon)
    const tag = trimmed.slice(lastColon + 1)
    if (!repository || !tag) return null
    return { repository, tag }
  }

  /**
   * Retrieves image disk usage as reported by Docker (`docker system df -v`) when possible,
   * falling back to `docker image ls` size when needed.
   */
  async getImageDiskUsage(imageRef: string): Promise<{
    repository: string
    tag: string
    sizeBytes: number | null
    sharedBytes: number | null
    uniqueBytes: number | null
  } | null> {
    const parsedRef = this.parseImageRef(imageRef)
    if (!parsedRef) return null

    const { repository, tag } = parsedRef
    const fromDf = await this.getImageDiskUsageFromSystemDf(repository, tag)
    if (fromDf) return fromDf

    const fromList = await this.getImageSizeFromImageList(repository, tag)
    return {
      repository,
      tag,
      sizeBytes: fromList,
      sharedBytes: null,
      uniqueBytes: null
    }
  }

  private async getImageDiskUsageFromSystemDf(
    repository: string,
    tag: string
  ): Promise<{
    repository: string
    tag: string
    sizeBytes: number | null
    sharedBytes: number | null
    uniqueBytes: number | null
  } | null> {
    try {
      const report = await this.getDiskUsageReport(true)
      if (!report) return null

      const lines = report.split('\n')
      const headerIndex = lines.findIndex((line) => line.trim().startsWith('REPOSITORY'))
      if (headerIndex === -1) return null

      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()

        if (!trimmed) break
        if (trimmed.startsWith('Containers space usage:')) break

        const columns = trimmed.split(/\s{2,}/)
        if (columns.length < 8) continue

        const repo = columns[0]
        const rowTag = columns[1]
        if (repo !== repository || rowTag !== tag) continue

        const sizeBytes = parseDockerHumanSizeToBytes(columns[4] ?? '')
        const sharedBytes = parseDockerHumanSizeToBytes(columns[5] ?? '')
        const uniqueBytes = parseDockerHumanSizeToBytes(columns[6] ?? '')
        return { repository: repo, tag: rowTag, sizeBytes, sharedBytes, uniqueBytes }
      }

      return null
    } catch (error) {
      log.debug(
        '[docker] Failed to parse image disk usage from system df:',
        getErrorMessage(error, 'Failed to parse image disk usage')
      )
      return null
    }
  }

  private async getImageSizeFromImageList(repository: string, tag: string): Promise<number | null> {
    try {
      const docker = await this.getDockerCommand()
      const ref = `${repository}:${tag}`
      const { stdout } = await execa(docker, [
        'image',
        'ls',
        '--filter',
        `reference=${ref}`,
        '--format',
        '{{.Size}}'
      ])

      const sizeText = stdout.trim()
      if (!sizeText) return null
      return parseDockerHumanSizeToBytes(sizeText)
    } catch (error) {
      log.debug(
        `[docker] Failed to get image size from image ls for ${repository}:${tag}:`,
        getErrorMessage(error, 'Failed to get image size from image ls')
      )
      return null
    }
  }

  async getImageSizeBytes(image: string): Promise<number | null> {
    try {
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, ['image', 'inspect', image, '--format', '{{.Size}}'])
      const trimmed = stdout.trim()
      if (!trimmed) return null
      const parsed = Number(trimmed)
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
    } catch (error) {
      log.debug(
        `[docker] Failed to inspect image size for ${image}:`,
        getErrorMessage(error, 'Failed to inspect image size')
      )
      return null
    }
  }

  /**
   * Returns container size text as reported by `docker ps --size` (not bytes).
   * Example: "12.3MB (virtual 1.2GB)".
   */
  async getContainerSizeText(name: string): Promise<string | null> {
    try {
      const docker = await this.getDockerCommand()
      const { stdout } = await execa(docker, [
        'ps',
        '-a',
        '--size',
        '--filter',
        `name=^${name}$`,
        '--format',
        '{{.Size}}'
      ])

      const trimmed = stdout.trim()
      return trimmed || null
    } catch (error) {
      log.debug(
        `[docker] Failed to get container size for ${name}:`,
        getErrorMessage(error, 'Failed to get container size')
      )
      return null
    }
  }

  /**
   * Returns container disk usage numbers as reported by `docker ps --size`.
   * `writableBytes` is the container's write layer; `virtualBytes` includes image layers.
   */
  async getContainerDiskUsage(name: string): Promise<{
    sizeText: string | null
    writableBytes: number | null
    virtualBytes: number | null
  }> {
    const sizeText = await this.getContainerSizeText(name)
    if (!sizeText) {
      return { sizeText: null, writableBytes: null, virtualBytes: null }
    }

    const match = sizeText.match(/^(\S+)\s*\\(virtual\\s+(\\S+)\\)$/i)
    if (!match) {
      return {
        sizeText,
        writableBytes: parseDockerHumanSizeToBytes(sizeText),
        virtualBytes: null
      }
    }

    return {
      sizeText,
      writableBytes: parseDockerHumanSizeToBytes(match[1] ?? ''),
      virtualBytes: parseDockerHumanSizeToBytes(match[2] ?? '')
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
        throw ensureError(dockerContainerNotRunningError(name))
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

    const status = await this.getContainerStatus(name)
    const ports = status?.ports?.join(', ') || '(none)'
    const statusLabel = status?.status || 'unknown'
    const stateSummary = await this.getContainerStateSummary(name)
    log.error(
      `[docker] Container ${name} health check failed after ${maxRetries} attempts (status=${statusLabel}, ports=${ports}, state=${JSON.stringify(stateSummary)})`
    )

    const tailLogs = await this.getLogs(name, { tail: 200 })
    if (tailLogs.trim()) {
      log.error(`[docker] Container ${name} last logs (tail=200):\n${tailLogs}`)
    }

    throw ensureError(dockerHealthCheckFailedError(name, maxRetries))
  }

  /**
   * Get the published host port for a container port (via `docker inspect`).
   * This is more reliable than parsing `docker ps` port strings.
   */
  async getPublishedPort(
    name: string,
    containerPort: number,
    protocol: 'tcp' | 'udp' = 'tcp'
  ): Promise<number | null> {
    try {
      const docker = await this.getDockerCommand()
      const portKey = `${containerPort}/${protocol}`
      const format = `{{json (index .NetworkSettings.Ports "${portKey}")}}`
      const { stdout } = await execa(docker, ['inspect', name, '--format', format])

      const trimmed = stdout.trim()
      console.log({ stdout })
      if (!trimmed || trimmed === 'null') {
        return null
      }

      const bindings = JSON.parse(trimmed)
      if (!Array.isArray(bindings) || bindings.length === 0) {
        return null
      }

      const hostPort = bindings[0]?.HostPort
      if (typeof hostPort !== 'string') {
        return null
      }

      const parsed = Number(hostPort)
      console.log({ parsed })
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null
    } catch (error) {
      log.debug(
        `[docker] Failed to resolve published port for ${name}:${containerPort}/${protocol}:`,
        getErrorMessage(error, 'Failed to resolve published port')
      )
      return null
    }
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
