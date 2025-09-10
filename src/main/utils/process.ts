import treeKill from 'tree-kill'

/**
 * Configuration options for killing processes
 */
export interface KillProcessOptions {
  /** Timeout in milliseconds before force kill (default: 5000) */
  timeout?: number
  /** Initial signal to send (default: 'SIGTERM') */
  signal?: NodeJS.Signals
  /** Whether to force kill after timeout (default: true) */
  forceKill?: boolean
}

/**
 * Result of a kill operation
 */
export interface KillResult {
  pid: number
  success: boolean
  error?: Error
  graceful?: boolean
}

/**
 * Error thrown when kill operation fails
 */
export class ProcessKillError extends Error {
  constructor(
    message: string,
    public readonly pid: number,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'ProcessKillError'
  }
}

/**
 * Kill a process and all its children with graceful shutdown attempt
 * @param pid - Process ID to kill
 * @param options - Configuration options
 * @returns Promise that resolves when process is killed
 * @throws ProcessKillError if kill operation fails
 */
export async function killProcess(
  pid: number,
  options: KillProcessOptions = {}
): Promise<KillResult> {
  const { timeout = 5000, signal = 'SIGTERM', forceKill = true } = options

  return new Promise<KillResult>((resolve, reject) => {
    // Validate PID
    if (!pid || typeof pid !== 'number' || pid <= 0) {
      reject(new ProcessKillError('Invalid PID provided', pid))
      return
    }

    console.log(`Attempting to kill process ${pid} with ${signal}`)

    // First attempt: graceful termination
    treeKill(pid, signal, (err) => {
      if (err) {
        if ('code' in err && err.code === 'ESRCH') {
          console.log(`Process ${pid} already terminated`)
          resolve({
            pid,
            success: true,
            graceful: true
          })
          return
        }

        reject(new ProcessKillError(`Failed to kill process ${pid}: ${err.message}`, pid, err))
        return
      }

      console.log(`Sent ${signal} to process ${pid}`)

      // If force kill is disabled, resolve immediately
      if (!forceKill) {
        resolve({
          pid,
          success: true,
          graceful: true
        })
        return
      }

      let resolved = false

      // Wait for graceful shutdown, then force kill if needed
      const forceKillTimer = setTimeout(() => {
        if (resolved) return

        console.log(`Process ${pid} didn't terminate gracefully, force killing...`)

        treeKill(pid, 'SIGKILL', (killErr) => {
          if (resolved) return
          resolved = true

          if (killErr) {
            if ('code' in killErr && killErr.code === 'ESRCH') {
              console.log(`Process ${pid} terminated during grace period`)
              resolve({
                pid,
                success: true,
                graceful: true
              })
            } else {
              reject(
                new ProcessKillError(
                  `Failed to force kill process ${pid}: ${killErr.message}`,
                  pid,
                  killErr
                )
              )
            }
          } else {
            console.log(`Process ${pid} force killed`)
            resolve({
              pid,
              success: true,
              graceful: false
            })
          }
        })
      }, timeout)

      // Check if process is still alive periodically
      const checkInterval = setInterval(() => {
        if (resolved) {
          clearInterval(checkInterval)
          return
        }

        try {
          // process.kill with signal 0 checks if process exists without killing it
          process.kill(pid, 0)
        } catch (e: any) {
          if (e.code === 'ESRCH') {
            // Process is dead
            resolved = true
            clearTimeout(forceKillTimer)
            clearInterval(checkInterval)
            console.log(`Process ${pid} terminated gracefully`)
            resolve({
              pid,
              success: true,
              graceful: true
            })
          }
        }
      }, 500)

      // Cleanup interval when force kill timer expires
      forceKillTimer.unref?.()
      setTimeout(() => {
        clearInterval(checkInterval)
      }, timeout + 1000)
    })
  })
}

/**
 * Result of killing multiple processes
 */
export interface MultiKillResult {
  successful: KillResult[]
  failed: Array<KillResult & { error: Error }>
  totalCount: number
  successCount: number
  failureCount: number
}

/**
 * Kill multiple processes concurrently
 * @param pids - Array of process IDs
 * @param options - Same options as killProcess
 * @returns Promise with results of all kill operations
 */
export async function killMultipleProcesses(
  pids: number[],
  options: KillProcessOptions = {}
): Promise<MultiKillResult> {
  if (!Array.isArray(pids) || pids.length === 0) {
    throw new Error('PIDs must be a non-empty array')
  }

  const killPromises = pids.map(async (pid): Promise<KillResult> => {
    try {
      return await killProcess(pid, options)
    } catch (error) {
      console.error(`Failed to kill process ${pid}:`, (error as Error).message)
      return {
        pid,
        success: false,
        error: error as Error
      }
    }
  })

  const results = await Promise.all(killPromises)

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success) as Array<KillResult & { error: Error }>

  return {
    successful,
    failed,
    totalCount: results.length,
    successCount: successful.length,
    failureCount: failed.length
  }
}

/**
 * Simple kill function for basic use cases
 * @param pid - Process ID to kill
 * @returns Promise that resolves when process is killed
 */
export async function simpleKill(pid: number): Promise<void> {
  await killProcess(pid, { timeout: 3000 })
}

/**
 * Check if a process exists
 * @param pid - Process ID to check
 * @returns True if process exists, false otherwise
 */
export function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (e: any) {
    return e.code !== 'ESRCH'
  }
}

/**
 * Process manager class for tracking and managing multiple processes
 */
export class ProcessManager {
  private processes = new Map<string, number>()

  /**
   * Add a process to be managed
   * @param name - Unique name for the process
   * @param pid - Process ID
   */
  addProcess(name: string, pid: number): void {
    this.processes.set(name, pid)
  }

  /**
   * Remove a process from management (doesn't kill it)
   * @param name - Process name
   * @returns True if process was removed, false if not found
   */
  removeProcess(name: string): boolean {
    return this.processes.delete(name)
  }

  /**
   * Get process ID by name
   * @param name - Process name
   * @returns Process ID or undefined if not found
   */
  getProcessId(name: string): number | undefined {
    return this.processes.get(name)
  }

  /**
   * Get all managed process names and IDs
   * @returns Array of [name, pid] pairs
   */
  getAllProcesses(): Array<[string, number]> {
    return Array.from(this.processes.entries())
  }

  /**
   * Kill a specific managed process
   * @param name - Process name
   * @param options - Kill options
   * @returns Promise that resolves when process is killed
   * @throws Error if process not found
   */
  async killProcess(name: string, options?: KillProcessOptions): Promise<KillResult> {
    const pid = this.processes.get(name)
    if (!pid) {
      throw new Error(`Process '${name}' not found`)
    }

    const result = await killProcess(pid, options)
    if (result.success) {
      this.processes.delete(name)
    }
    return result
  }

  /**
   * Kill all managed processes
   * @param options - Kill options
   * @returns Promise with results of all kill operations
   */
  async killAll(options?: KillProcessOptions): Promise<MultiKillResult> {
    const pids = Array.from(this.processes.values())
    const result = await killMultipleProcesses(pids, options)

    // Remove successfully killed processes
    result.successful.forEach((r) => {
      for (const [name, pid] of this.processes.entries()) {
        if (pid === r.pid) {
          this.processes.delete(name)
          break
        }
      }
    })

    return result
  }

  /**
   * Check which managed processes are still running
   * @returns Array of [name, pid] pairs for running processes
   */
  getRunningProcesses(): Array<[string, number]> {
    return Array.from(this.processes.entries()).filter(([, pid]) => processExists(pid))
  }

  /**
   * Clean up dead processes from management
   * @returns Number of processes removed
   */
  cleanupDeadProcesses(): number {
    const deadProcesses: string[] = []

    for (const [name, pid] of this.processes.entries()) {
      if (!processExists(pid)) {
        deadProcesses.push(name)
      }
    }

    deadProcesses.forEach((name) => this.processes.delete(name))
    return deadProcesses.length
  }

  /**
   * Get count of managed processes
   * @returns Number of managed processes
   */
  get count(): number {
    return this.processes.size
  }
}
