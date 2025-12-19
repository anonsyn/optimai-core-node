import { app } from 'electron'
import pRetry from 'p-retry'
import log from '../configs/logger'
import {
  authNoTokensError,
  authUserFetchError,
  authUserPayloadMissingError,
  nodeStartFailedError
} from '../errors/error-factory'
import { apiClient } from '../libs/axios'
import { dockerService } from '../services/docker/docker-service'
import { eventsService } from '../services/events-service'
import { tokenStore, userStore } from '../storage'
import { formatBytes, getDirectorySizeBytes, truncateText } from '../utils/disk-usage'
import { getErrorMessage } from '../utils/get-error-message'
import { ensureError } from '../utils/ensure-error'
import { sleep } from '../utils/sleep'
import { crawl4AiService } from '../services/docker/crawl4ai-service'
import { miningWorker } from './mining-worker'
import { registerDevice } from './register-device'
import { uptimeRunner } from './uptime-runner'

export class NodeRuntime {
  private running = false

  private async logStorageSnapshot(stage: 'start'): Promise<void> {
    try {
      const userDataPath = app.getPath('userData')
      const logsPath = app.getPath('logs')

      const crawl4Ai = crawl4AiService.getDiagnostics()
      const imageName = typeof crawl4Ai.imageName === 'string' ? crawl4Ai.imageName : null
      const containerName =
        typeof crawl4Ai.containerName === 'string' ? crawl4Ai.containerName : null

      const [userData, logs, dockerDf] = await Promise.all([
        getDirectorySizeBytes(userDataPath, { maxDurationMs: 2_000 }),
        getDirectorySizeBytes(logsPath, { maxDurationMs: 2_000 }),
        dockerService.getDiskUsageReport(true)
      ])

      const [crawl4AiImageSizeBytes, crawl4AiContainerSizeText] = await Promise.all([
        imageName ? dockerService.getImageDiskUsage(imageName) : Promise.resolve(null),
        containerName ? dockerService.getContainerDiskUsage(containerName) : Promise.resolve(null)
      ])

      log.info('[storage] Snapshot', {
        stage,
        app: {
          version: app.getVersion(),
          userDataPath,
          logsPath,
          userDataSize: formatBytes(userData.bytes),
          logsSize: formatBytes(logs.bytes),
          truncated: userData.truncated || logs.truncated
        },
        docker: {
          crawl4ai: {
            imageName,
            imageSizeBytes: crawl4AiImageSizeBytes?.sizeBytes ?? null,
            imageSize: crawl4AiImageSizeBytes?.sizeBytes
              ? formatBytes(crawl4AiImageSizeBytes.sizeBytes)
              : null,
            imageUniqueSizeBytes: crawl4AiImageSizeBytes?.uniqueBytes ?? null,
            imageUniqueSize: crawl4AiImageSizeBytes?.uniqueBytes
              ? formatBytes(crawl4AiImageSizeBytes.uniqueBytes)
              : null,
            imageSharedSizeBytes: crawl4AiImageSizeBytes?.sharedBytes ?? null,
            imageSharedSize: crawl4AiImageSizeBytes?.sharedBytes
              ? formatBytes(crawl4AiImageSizeBytes.sharedBytes)
              : null,
            containerName,
            containerSize: crawl4AiContainerSizeText?.sizeText ?? null,
            containerWritableBytes: crawl4AiContainerSizeText?.writableBytes ?? null,
            containerWritableSize: crawl4AiContainerSizeText?.writableBytes
              ? formatBytes(crawl4AiContainerSizeText.writableBytes)
              : null,
            containerVirtualBytes: crawl4AiContainerSizeText?.virtualBytes ?? null,
            containerVirtualSize: crawl4AiContainerSizeText?.virtualBytes
              ? formatBytes(crawl4AiContainerSizeText.virtualBytes)
              : null
          },
          diskUsage: dockerDf ? truncateText(dockerDf, 8000) : null
        }
      })

      // Report a compact snapshot (avoid sending local paths or large docker df output)
      await eventsService.reportEvent({
        type: 'node.storage_snapshot',
        severity: 'info',
        message: 'Storage snapshot',
        metadata: {
          stage,
          appVersion: app.getVersion(),
          userDataBytes: userData.bytes,
          logsBytes: logs.bytes,
          truncated: userData.truncated || logs.truncated,
          docker: {
            crawl4ai: {
              imageName,
              imageSizeBytes: crawl4AiImageSizeBytes?.sizeBytes ?? null,
              imageUniqueSizeBytes: crawl4AiImageSizeBytes?.uniqueBytes ?? null,
              imageSharedSizeBytes: crawl4AiImageSizeBytes?.sharedBytes ?? null,
              containerName,
              containerWritableBytes: crawl4AiContainerSizeText?.writableBytes ?? null,
              containerVirtualBytes: crawl4AiContainerSizeText?.virtualBytes ?? null
            }
          }
        }
      })
    } catch (error) {
      log.debug(getErrorMessage(error, '[storage] Failed to capture storage snapshot'))
    }
  }

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

      void this.logStorageSnapshot('start')

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
