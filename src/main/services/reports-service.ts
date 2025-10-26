import { app } from 'electron'
import axios from 'axios'
import { createHash } from 'crypto'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { PassThrough } from 'stream'
import { pipeline } from 'stream/promises'
import tar from 'tar-stream'
import { createGzip } from 'zlib'
import log from '../configs/logger'
import { reportsApi } from '../api/reports'
import { deviceStore, userStore } from '../storage'
import { getErrorMessage } from '../utils/get-error-message'
import {
  BugReportSubmissionResult,
  ClientType,
  CreateReportBody,
  CreateReportResponse,
  OSPlatform,
  SubmitBugReportPayload
} from '@shared/reports/types'

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB limit enforced server-side
const LOG_FILE_PATTERN = /^log(\.log|-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.log)$/
const INITIAL_TRUNCATION_FRACTIONS = [1, 0.5, 0.25] as const
const MIN_TAIL_BYTES = 128 * 1024 // keep at least 128KB when truncating
const FALLBACK_ACTIVE_LOG_BYTES = 512 * 1024 // final fallback keeps 512KB from active log
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface LogFileEntry {
  name: string
  path: string
  mtimeMs: number
  data: Buffer
}

interface PreparedLogBundle {
  buffer: Buffer
  byteLength: number
  sha256: string
  bytesPerFile: Record<string, number>
}

const resolveOsPlatform = (): OSPlatform => {
  switch (process.platform) {
    case 'darwin':
      return OSPlatform.DARWIN
    case 'win32':
      return OSPlatform.WIN32
    case 'linux':
      return OSPlatform.LINUX
    default:
      return OSPlatform.WEB
  }
}

const resolveChannel = (): string => {
  const fromEnv = process.env.APP_CHANNEL?.trim()
  if (fromEnv) {
    return fromEnv.slice(0, 32)
  }

  return app.isPackaged ? 'production' : 'development'
}

const resolveBuild = (): string | undefined => {
  const build = process.env.APP_BUILD ?? process.env.GIT_COMMIT_SHA
  if (!build) {
    return undefined
  }

  return build.slice(0, 64)
}

const buildDeviceInfo = () => {
  const cpus = os.cpus()
  const totalGB = os.totalmem() / 1024 / 1024 / 1024

  return {
    os: {
      platform: resolveOsPlatform(),
      version: os.release(),
      arch: process.arch
    },
    cpu: cpus.length
      ? {
          model: cpus[0]?.model,
          cores: cpus.length
        }
      : undefined,
    memory: {
      totalGB: Math.min(Math.round(totalGB * 100) / 100, 2048)
    },
    locale: app.getLocale(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome
  }
}

const toOptionalUuid = (value?: string): string | undefined => {
  if (!value) {
    return undefined
  }

  return UUID_REGEX.test(value) ? value : undefined
}

const sliceFromEnd = (buffer: Buffer, bytes: number): Buffer => {
  if (buffer.length <= bytes) {
    return buffer
  }
  return buffer.subarray(buffer.length - bytes)
}

const tailByFraction = (buffer: Buffer, fraction: number): Buffer => {
  if (fraction >= 1) {
    return buffer
  }

  const keepBytes = Math.min(
    buffer.length,
    Math.max(Math.floor(buffer.length * fraction), Math.min(buffer.length, MIN_TAIL_BYTES))
  )

  return sliceFromEnd(buffer, keepBytes)
}

const createTarGz = async (entries: Array<{ name: string; content: Buffer }>): Promise<Buffer> => {
  if (entries.length === 0) {
    return Buffer.alloc(0)
  }

  const pack = tar.pack()
  const gzip = createGzip({ level: 9 })
  const sink = new PassThrough()
  const chunks: Buffer[] = []

  sink.on('data', (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  })

  const pipelinePromise = pipeline(pack, gzip, sink)

  try {
    for (const entry of entries) {
      pack.entry(
        {
          name: entry.name,
          size: entry.content.length,
          mode: 0o600,
          mtime: new Date()
        },
        entry.content
      )
    }

    pack.finalize()
    await pipelinePromise
    return Buffer.concat(chunks)
  } catch (error) {
    pack.destroy()
    gzip.destroy()
    sink.destroy()
    throw error
  }
}

const loadLogFiles = async (limit = 2): Promise<LogFileEntry[]> => {
  const logDir = app.getPath('logs')

  try {
    const entries = await fs.readdir(logDir)

    const stats = await Promise.all(
      entries.map(async (fileName) => {
        if (!LOG_FILE_PATTERN.test(fileName)) {
          return null
        }

        const filePath = path.join(logDir, fileName)
        try {
          const stat = await fs.stat(filePath)
          if (!stat.isFile() || stat.size === 0) {
            return null
          }

          const data = await fs.readFile(filePath)

          return {
            name: fileName,
            path: filePath,
            mtimeMs: stat.mtimeMs,
            data
          }
        } catch (error) {
          log.warn('[reports] Failed to read log file', filePath, getErrorMessage(error, ''))
          return null
        }
      })
    )

    const files = stats.filter((entry): entry is LogFileEntry => entry !== null)

    return files
      .sort((a, b) => b.mtimeMs - a.mtimeMs)
      .slice(0, limit)
  } catch (error) {
    log.warn('[reports] Failed to enumerate log directory', getErrorMessage(error, ''))
    return []
  }
}

const prepareLogBundle = async (): Promise<PreparedLogBundle> => {
  const logFiles = await loadLogFiles()

  if (logFiles.length === 0) {
    const placeholder = Buffer.from('No log files were found on the client machine.')
    const buffer = await createTarGz([
      {
        name: 'log-placeholder.txt',
        content: placeholder
      }
    ])

    return {
      buffer,
      byteLength: buffer.byteLength,
      sha256: createHash('sha256').update(buffer).digest('hex'),
      bytesPerFile: {
        'log-placeholder.txt': placeholder.length
      }
    }
  }

  for (const fraction of INITIAL_TRUNCATION_FRACTIONS) {
    const entries = logFiles.map((file) => ({
      name: file.name,
      content: tailByFraction(file.data, fraction)
    }))

    const buffer = await createTarGz(entries)

    if (buffer.byteLength <= MAX_UPLOAD_SIZE_BYTES) {
      return {
        buffer,
        byteLength: buffer.byteLength,
        sha256: createHash('sha256').update(buffer).digest('hex'),
        bytesPerFile: Object.fromEntries(entries.map(({ name, content }) => [name, content.length]))
      }
    }
  }

  // Final fallback: only include the newest log file with a capped tail
  const primary = logFiles[0]
  const fallbackContent = sliceFromEnd(primary.data, Math.min(primary.data.length, FALLBACK_ACTIVE_LOG_BYTES))
  const buffer = await createTarGz([
    {
      name: primary.name,
      content: fallbackContent
    }
  ])

  if (buffer.byteLength > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('Log bundle still exceeds 10MB after truncation')
  }

  return {
    buffer,
    byteLength: buffer.byteLength,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    bytesPerFile: {
      [primary.name]: fallbackContent.length
    }
  }
}

class ReportsService {
  async submitBugReport(payload: SubmitBugReportPayload): Promise<BugReportSubmissionResult> {
    const trimmedEmail = payload.email?.trim()

    const bundle = await prepareLogBundle()

    log.info('[reports] Prepared log bundle', {
      size: bundle.byteLength,
      files: bundle.bytesPerFile
    })

    if (bundle.byteLength > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error('Prepared log bundle exceeds 10MB limit')
    }

    const body: CreateReportBody = {
      title: payload.title,
      description: payload.description,
      email: trimmedEmail && trimmedEmail.length > 0 ? trimmedEmail : undefined,
      clientType: ClientType.ELECTRON,
      osPlatform: resolveOsPlatform(),
      appVersion: app.getVersion(),
      channel: resolveChannel(),
      build: resolveBuild(),
      deviceInfo: buildDeviceInfo(),
      context: this.buildContext(),
      includeLogs: true,
      sizeHintBytes: bundle.byteLength
    }

    let createResponse: CreateReportResponse

    try {
      const response = await reportsApi.createReport(body)
      createResponse = response.data
    } catch (error) {
      log.error('[reports] Failed to create bug report', getErrorMessage(error, ''))
      throw new Error('Failed to create bug report')
    }

    if (!createResponse.reportId || !createResponse.uploadUrl) {
      throw new Error('Bug report response did not include upload URL')
    }

    if (bundle.byteLength > createResponse.maxUploadBytes) {
      throw new Error('Log bundle exceeds server upload limit')
    }

    try {
      await axios.put(createResponse.uploadUrl, bundle.buffer, {
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Length': String(bundle.byteLength)
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      })
    } catch (error) {
      log.error('[reports] Failed to upload log bundle', getErrorMessage(error, ''))
      throw new Error('Failed to upload log bundle')
    }

    try {
      const completePayload = {
        size: bundle.byteLength,
        sha256: bundle.sha256
      }

      const { data } = await reportsApi.completeReport(createResponse.reportId, completePayload)

      return {
        reportId: createResponse.reportId,
        status: data.status,
        uploadedAt: data.uploadedAt,
        size: bundle.byteLength
      }
    } catch (error) {
      log.error('[reports] Failed to finalize bug report', getErrorMessage(error, ''))
      throw new Error('Failed to finalize bug report upload')
    }
  }

  private buildContext() {
    const deviceId = deviceStore.getDeviceId()
    const user = userStore.getUser()

    const additionalData: Record<string, unknown> = {
      appVersion: app.getVersion(),
      channel: resolveChannel(),
      packaged: app.isPackaged
    }

    return {
      installId: toOptionalUuid(deviceId) ?? deviceId,
      additionalData,
      featureFlags: undefined,
      breadcrumbs: undefined,
      sessionId: toOptionalUuid(user?.id)
    }
  }
}

export const reportsService = new ReportsService()
