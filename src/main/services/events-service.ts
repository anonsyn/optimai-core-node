import { randomUUID } from 'crypto'
import { app } from 'electron'
import log from '../configs/logger'
import { eventsApi, type EventSeverity } from '../api/events'
import { deviceStore, userStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'

interface ReportEventOptions {
  type: string
  message: string
  severity: EventSeverity
  metadata?: Record<string, unknown>
  eventId?: string
  ts?: Date | string
}

interface ReportErrorOptions extends Omit<ReportEventOptions, 'severity'> {
  severity?: EventSeverity
  error?: unknown
}

class EventsService {
  private readonly source = 'desktop-core-node'

  private resolveTimestamp(ts?: Date | string): string {
    if (!ts) {
      return new Date().toISOString()
    }

    return ts instanceof Date ? ts.toISOString() : ts
  }

  private mergeMetadata(
    metadata?: Record<string, unknown>,
    context?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    const merged = { ...(metadata ?? {}) }

    Object.entries(context ?? {}).forEach(([key, value]) => {
      if (value !== undefined && merged[key] === undefined) {
        merged[key] = value
      }
    })

    const cleanedEntries = Object.entries(merged).filter(([, value]) => value !== undefined)
    if (cleanedEntries.length === 0) {
      return undefined
    }

    return Object.fromEntries(cleanedEntries)
  }

  async reportEvent(options: ReportEventOptions): Promise<void> {
    const user = userStore.getUser()
    const deviceId = deviceStore.getDeviceId()
    const clientId = user?.id ?? deviceId ?? undefined
    const metadata = this.mergeMetadata(options.metadata, {
      userId: user?.id,
      deviceId
    })

    const payload = {
      source: this.source,
      clientId,
      eventId: options.eventId ?? randomUUID(),
      type: options.type,
      severity: options.severity,
      message: options.message,
      metadata,
      ts: this.resolveTimestamp(options.ts)
    }

    try {
      await eventsApi.reportEvent(payload)
    } catch (error) {
      log.warn(
        '[events] Failed to report event:',
        getErrorMessage(error, `Failed to report event ${options.type}`)
      )
    }
  }

  async reportError(options: ReportErrorOptions): Promise<void> {
    const { error, severity = 'error', metadata, ...rest } = options
    let errorMessage: string | undefined

    if (error) {
      errorMessage = getErrorMessage(error, options.message)
    }

    const metadataWithError = this.mergeMetadata(metadata, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      nodeVersion: app.getVersion()
    })

    await this.reportEvent({
      ...rest,
      severity,
      metadata: metadataWithError
    })
  }
}

export const eventsService = new EventsService()
