import EventEmitter from 'eventemitter3'

import { apiClient } from '../libs/axios'
import type { UptimeData } from '../storage'
import { tokenStore, userStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'
import { sleep } from '../utils/sleep'
import { MiningWorker, type MiningWorkerStatus } from './mining-worker'
import { registerDevice } from './register-device'
import type { MiningAssignment, NodeStatusResponse } from './types'
import { NodeStatus } from './types'
import { UptimeRunner } from './uptime-runner'

export enum NodeRuntimeEvent {
  Status = 'status',
  UptimeReward = 'uptime-reward',
  UptimeCycle = 'uptime-cycle',
  MiningAssignment = 'mining-assignment',
  MiningAssignmentCompleted = 'mining-assignment-completed',
  MiningError = 'mining-error',
  MiningStatusChanged = 'mining-status-changed',
  Error = 'error'
}

type NodeRuntimeEventMap = {
  [NodeRuntimeEvent.Status]: (status: NodeStatusResponse) => void
  [NodeRuntimeEvent.UptimeReward]: (reward: { amount: string; timestamp: number }) => void
  [NodeRuntimeEvent.UptimeCycle]: (cycle: UptimeData) => void
  [NodeRuntimeEvent.MiningAssignment]: (assignment: MiningAssignment) => void
  [NodeRuntimeEvent.MiningAssignmentCompleted]: (assignmentId: string) => void
  [NodeRuntimeEvent.MiningError]: (error: Error) => void
  [NodeRuntimeEvent.MiningStatusChanged]: (status: MiningWorkerStatus) => void
  [NodeRuntimeEvent.Error]: (error: Error) => void
}

export class NodeRuntime extends EventEmitter<NodeRuntimeEventMap> {
  private status: NodeStatus = NodeStatus.Idle
  private running = false
  private lastError: string | null = null

  private readonly uptimeRunner = new UptimeRunner()
  private readonly miningWorker = new MiningWorker()

  constructor() {
    super()

    this.uptimeRunner.on('reward', (reward) => {
      this.emit(NodeRuntimeEvent.UptimeReward, reward)
    })

    this.uptimeRunner.on('cycle', (cycle) => {
      this.emit(NodeRuntimeEvent.UptimeCycle, cycle)
    })

    this.uptimeRunner.on('error', (error) => {
      this.lastError = error.message
      this.emit(NodeRuntimeEvent.Error, error)
      this.emit(NodeRuntimeEvent.Status, this.getStatus())
    })

    this.miningWorker.on('assignment', (assignment: MiningAssignment) => {
      this.emit(NodeRuntimeEvent.MiningAssignment, assignment)
    })

    this.miningWorker.on('assignmentCompleted', (assignmentId: string) => {
      this.emit(NodeRuntimeEvent.MiningAssignmentCompleted, assignmentId)
    })

    this.miningWorker.on('error', (error: Error) => {
      this.emit(NodeRuntimeEvent.MiningError, error)
    })

    this.miningWorker.on('statusChanged', (status: MiningWorkerStatus) => {
      this.emit(NodeRuntimeEvent.MiningStatusChanged, status)
    })
  }

  async start(): Promise<boolean> {
    if (this.running) {
      return true
    }

    if (!tokenStore.hasTokens()) {
      throw new Error('Authentication required before starting node')
    }

    this.running = true
    this.setStatus(NodeStatus.Starting)
    this.lastError = null

    try {
      await this.ensureUser()
      await registerDevice()

      this.uptimeRunner.start()
      this.miningWorker.start()
      await sleep(5000)

      this.setStatus(NodeStatus.Running)
      return true
    } catch (error) {
      const message = getErrorMessage(error, 'Node runtime error')
      const lastError = new Error(message)
      this.running = false
      this.lastError = message
      this.setStatus(NodeStatus.Idle)
      this.emit(NodeRuntimeEvent.Error, lastError)
      throw lastError
    }
  }

  async stop(): Promise<boolean> {
    if (!this.running) {
      return false
    }

    this.setStatus(NodeStatus.Stopping)
    this.running = false

    this.uptimeRunner.stop()
    await this.miningWorker.stop()

    this.setStatus(NodeStatus.Idle)
    this.lastError = null
    return true
  }

  getStatus(): NodeStatusResponse {
    return {
      status: this.status,
      running: this.running,
      last_error: this.lastError
    }
  }

  getMiningStatus(): MiningWorkerStatus {
    return this.miningWorker.getStatus()
  }

  private setStatus(status: NodeStatus) {
    this.status = status
    this.emit(NodeRuntimeEvent.Status, this.getStatus())
  }

  private async ensureUser() {
    if (userStore.hasUser()) {
      return
    }

    try {
      const response = await apiClient.get<{ user: any }>('/auth/me', {
        params: {
          platforms: 'all'
        }
      })

      const user = response.data?.user
      if (!user) {
        throw new Error('User payload missing')
      }

      userStore.saveUser(user)
    } catch {
      throw new Error('Failed to load user profile')
    }
  }
}

export const nodeRuntime = new NodeRuntime()
