import axios from 'axios'
import EventEmitter from 'eventemitter3'
import { ExecaChildProcess, ExecaError } from 'execa'
import {
  BehaviorSubject,
  catchError,
  concatMap,
  defer,
  firstValueFrom,
  map,
  of,
  race,
  Subject,
  take,
  takeUntil,
  throwError,
  timer
} from 'rxjs'
import { IS_DEV } from '../configs/constants'
import logger from '../configs/logger'
import { retryAfter } from '../utils/rx-operators'
import { nodeCommands } from './commands'
import { NodeStatus } from './types'

type NodeProcess = ExecaChildProcess

interface NodeServerEvents {
  statusChange: [NodeStatus]
}

class NodeServer extends EventEmitter<NodeServerEvents> {
  private port: number | null = null
  private process: NodeProcess | null = null
  private status = new BehaviorSubject<NodeStatus>(NodeStatus.Idle)
  private pingAbortSignal: Subject<void> = new Subject()
  private restartAbortSignal: Subject<void> = new Subject()
  private intentionalShutdown = false // Added flag

  constructor() {
    super()
    this.status.subscribe((status) => {
      this.emit('statusChange', status)
    })
  }

  get isRunning() {
    const currentStatus = this.status.getValue()
    return currentStatus === NodeStatus.Running
  }

  get isStopping() {
    const currentStatus = this.status.getValue()
    return currentStatus === NodeStatus.Stopping
  }

  get isRestarting() {
    const currentStatus = this.status.getValue()
    return currentStatus === NodeStatus.Restarting
  }

  get canStart() {
    const currentStatus = this.status.getValue()
    return currentStatus === NodeStatus.Idle
  }

  getStatus() {
    return this.status.getValue()
  }

  getServerUrl() {
    return `http://127.0.0.1:${this.port}`
  }

  getPort() {
    return this.port
  }

  async start() {
    try {
      if (!this.canStart) {
        logger.info(`Node is already running on port ${this.port}`)
        return
      }

      const { default: getPort } = await import('get-port')
      const port = await getPort()
      logger.info(`Starting node on port ${port}`)

      this.port = port
      this.status.next(NodeStatus.Running)
      this.intentionalShutdown = false // Reset flag
      this.pingAbortSignal = new Subject<void>()
      this.restartAbortSignal = new Subject<void>()

      const process = this.runNodeProcess()
      const ping = timer(3000).pipe(concatMap(() => this.pingServer()))

      await firstValueFrom(
        race(process, ping).pipe(
          map(() => true),
          take(1)
        )
      )
      this.autoRestartNode()
      logger.info(`Node is running on port ${port}`)
      if (IS_DEV) {
        const serverUrl = this.getServerUrl()
        console.log('Server is running on:', serverUrl)
      }

      return true
    } catch (error) {
      logger.error(`Failed to start node`, error)
      this.status.next(NodeStatus.Idle)
      this.port = null
      this.process = null
      return false
    }
  }

  private runNodeProcess() {
    const port = this.port
    if (!port) {
      throw new Error('Port is not set')
    }
    this.process = nodeCommands.startNode(port)

    this.process.stdout?.on('data', (data: Buffer) => {
      const output = data.toString().trim()
      logger.info(`Node stdout: ${output}`)
    })

    this.process.once('exit', (code, signal) => {
      if (!this.intentionalShutdown) {
        if (signal) {
          logger.warn(`Process was killed by signal: ${signal}`)
        } else if (code !== 0) {
          logger.warn(`Process crashed with exit code: ${code}`)
        } else {
          logger.info('Process exited gracefully but unexpectedly')
        }
        this.status.next(NodeStatus.Restarting)
      }
    })

    return this.process
  }

  private autoRestartNode() {
    let process = this.process as any
    if (!process) {
      logger.info('No process to restart')
      return
    }

    defer(() => process)
      .pipe(
        // Handle successful/graceful exits (code 0)
        concatMap(() => {
          if (this.intentionalShutdown) {
            logger.info('Node process exited gracefully due to intentional shutdown')
            this.intentionalShutdown = false // Reset flag
            return of(true)
          } else {
            logger.info('Node process exited gracefully but unexpectedly, restarting...')
            return throwError(() => new Error('Process exited gracefully but unexpectedly'))
          }
        }),
        // Handle crashes/kills/non-zero exits
        catchError((e: ExecaError) => {
          // Check if this was an intentional shutdown
          if (this.intentionalShutdown) {
            logger.info('Node process was stopped intentionally, not restarting')
            this.intentionalShutdown = false // Reset flag
            return of(true)
          }

          logger.info('Restarting node after crash/kill')

          process = this.runNodeProcess()

          timer(3000)
            .pipe(concatMap(() => this.pingServer()))
            .subscribe({
              next: () => {
                logger.info('Node restarted after crash')
              },
              error: (e) => {
                logger.error('Failed to restart node after crash', e)
              }
            })

          return throwError(() => e)
        }),
        retryAfter(2000),
        takeUntil(this.restartAbortSignal)
      )
      .subscribe(() => {
        logger.info('Node process monitoring completed')
        this.status.next(NodeStatus.Idle)
      })
  }

  private pingServer() {
    const port = this.port
    if (!port) {
      throw new Error('Port is not set')
    }
    //  Abort the previous ping
    this.pingAbortSignal.next()

    const serverUrl = this.getServerUrl()
    return defer(() => axios.get(`${serverUrl}/health`)).pipe(
      retryAfter(3000),
      takeUntil(this.pingAbortSignal),
      take(1)
    )
  }

  async stop() {
    if (!this.isRunning) {
      logger.info('Node is not running')
      return
    }

    console.log('Stopping node')

    this.intentionalShutdown = true // Set flag before killing
    this.status.next(NodeStatus.Stopping)

    if (this.process) {
      console.log('Killing process')

      // Send SIGINT signal for graceful shutdown
      this.process.kill('SIGINT')

      try {
        // Wait for the process to exit gracefully (with timeout)
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Process shutdown timeout'))
          }, 5000) // 5 second timeout

          this.process?.once('exit', (code, signal) => {
            clearTimeout(timeout)
            logger.info(`Process exited with code: ${code}, signal: ${signal}`)
            resolve()
          })
        })

        console.log('Process exited gracefully')
      } catch {
        // If graceful shutdown times out, force kill
        console.log('Graceful shutdown timed out, force killing process')
        this.process.kill('SIGKILL')

        // Wait a bit more for force kill to complete
        await new Promise<void>((resolve) => {
          const forceTimeout = setTimeout(resolve, 1000) // 1 second for force kill
          this.process?.once('exit', () => {
            clearTimeout(forceTimeout)
            resolve()
          })
        })
      }
    }

    this.status.next(NodeStatus.Idle)

    this.port = null
    this.process = null
    this.pingAbortSignal.next()
    this.pingAbortSignal.complete()
    this.restartAbortSignal.next()
    this.restartAbortSignal.complete()
    console.log('Node stopped')
    return true
  }
}

const nodeServer = new NodeServer()

export { nodeServer }
