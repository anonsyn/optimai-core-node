export const BugReportStatus = {
  PENDING: 'pending',
  UPLOADED: 'uploaded',
  TRIAGED: 'triaged',
  REJECTED: 'rejected'
} as const

export type BugReportStatus = (typeof BugReportStatus)[keyof typeof BugReportStatus]

export const ClientType = {
  ELECTRON: 'electron',
  WEB: 'web',
  MOBILE: 'mobile',
  CLI: 'cli',
  EXTENSION: 'extension'
} as const

export type ClientType = (typeof ClientType)[keyof typeof ClientType]

export const OSPlatform = {
  DARWIN: 'darwin',
  WIN32: 'win32',
  LINUX: 'linux',
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web'
} as const

export type OSPlatform = (typeof OSPlatform)[keyof typeof OSPlatform]

export interface BugReportDeviceInfo {
  os: {
    platform: OSPlatform
    version?: string
    arch?: string
  }
  cpu?: {
    model?: string
    cores?: number
  }
  gpu?: {
    vendor?: string
    model?: string
  }
  memory?: {
    totalGB?: number
  }
  locale?: string
  timezone?: string
  electronVersion?: string
  nodeVersion?: string
  chromeVersion?: string
}

export interface BugReportContext {
  installId?: string
  sessionId?: string
  breadcrumbs?: Array<
    | string
    | {
        timestamp?: string
        message: string
        data?: Record<string, unknown>
      }
  >
  featureFlags?: Record<string, boolean>
  additionalData?: Record<string, unknown>
}

export interface CreateReportBody {
  title: string
  description: string
  email?: string
  clientType: ClientType
  osPlatform: OSPlatform
  appVersion: string
  channel: string
  build?: string
  crashId?: string
  deviceInfo?: BugReportDeviceInfo
  context?: BugReportContext
  includeLogs?: boolean
  sizeHintBytes?: number
}

export interface CompleteReportBody {
  size: number
  sha256: string
}

export interface CreateReportResponse {
  reportId: string
  status: BugReportStatus
  uploadUrl: string | null
  objectKey: string | null
  expiresInSeconds: number | null
  maxUploadBytes: number
}

export interface CompleteReportResponse {
  status: BugReportStatus
  uploadedAt: string
}

export interface SubmitBugReportPayload {
  email?: string
  title: string
  description: string
}

export interface BugReportSubmissionResult {
  reportId: string
  status: BugReportStatus
  uploadedAt: string
  size: number
}
