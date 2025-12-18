import pRetry from 'p-retry'
import log from '../configs/logger'
import {
  authNoTokensError,
  authUserFetchError,
  authUserPayloadMissingError,
  nodeStartFailedError
} from '../errors/error-factory'
import { apiClient } from '../libs/axios'
import { eventsService } from '../services/events-service'
import { tokenStore, userStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'
import { ensureError } from '../utils/ensure-error'
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
      throw ensureError(authNoTokensError())
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
      const appError = nodeStartFailedError(message)
      await eventsService.reportError({
        type: 'node.start_failed',
        message: 'Node runtime failed to start',
        error,
        metadata: {
          wasRunning: this.running,
          errorCode: appError.code
        }
      })
      this.running = false
      throw ensureError(appError)
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
        throw ensureError(authUserPayloadMissingError())
      }

      userStore.saveUser(user)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load user profile')
      log.error(message)
      throw ensureError(authUserFetchError(message))
    }
  }
}

export const nodeRuntime = new NodeRuntime()
