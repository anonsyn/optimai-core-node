import pRetry from 'p-retry'
import log from '../configs/logger'
import { apiClient } from '../libs/axios'
import { eventsService } from '../services/events-service'
import { tokenStore, userStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'
import { sleep } from '../utils/sleep'
import { miningWorker } from './mining-worker'
import { registerDevice } from './register-device'
import { uptimeRunner } from './uptime-runner'

export class NodeRuntime {
  private running = false

  async start(): Promise<boolean> {
    if (this.running) {
      return true
    }

    if (!tokenStore.hasTokens()) {
      throw new Error('Authentication required before starting node')
    }

    this.running = true

    try {
      await this.ensureUser()
      await pRetry(() => registerDevice(), {
        retries: 1,
        minTimeout: 5000
      })

      uptimeRunner.start()
      miningWorker.start()
      await sleep(5000)

      return true
    } catch (error) {
      const message = getErrorMessage(error, 'Node runtime error')
      const lastError = new Error(message)
      await eventsService.reportError({
        type: 'node.start_failed',
        message: 'Node runtime failed to start',
        error,
        metadata: {
          wasRunning: this.running
        }
      })
      this.running = false
      throw lastError
    }
  }

  async stop(): Promise<boolean> {
    if (!this.running) {
      return false
    }

    this.running = false

    uptimeRunner.stop()
    await miningWorker.stop()

    return true
  }

  isRunning(): boolean {
    return this.running
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
    } catch (error) {
      log.error(getErrorMessage(error, 'Failed to load user profile'))
      throw error
    }
  }
}

export const nodeRuntime = new NodeRuntime()
