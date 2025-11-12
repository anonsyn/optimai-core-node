import { AppError, createError, ErrorCode } from './error-codes'

/**
 * Error factory functions for common error scenarios
 * These provide convenient ways to create AppErrors with appropriate codes
 */

// ==================== AUTHENTICATION ERRORS ====================

export function authNoTokensError(): AppError {
  return createError(ErrorCode.AUTH_1001, 'Authentication required before starting node')
}

export function authUserFetchError(originalMessage: string): AppError {
  return createError(ErrorCode.AUTH_1002, `Failed to load user profile: ${originalMessage}`)
}

export function authUserPayloadMissingError(): AppError {
  return createError(ErrorCode.AUTH_1003, 'User payload missing from API response')
}

export function authNoRefreshTokenError(): AppError {
  return createError(ErrorCode.AUTH_1004, 'No refresh token available')
}

export function authRefreshFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.AUTH_1005, `Token refresh failed: ${originalMessage}`)
}

// ==================== DOCKER ERRORS ====================

export function dockerNotInstalledError(): AppError {
  return createError(ErrorCode.DOCKER_2001, 'Docker is not installed')
}

export function dockerNotRunningError(): AppError {
  return createError(ErrorCode.DOCKER_2002, 'Docker is not running')
}

export function dockerCliNotFoundError(): AppError {
  return createError(
    ErrorCode.DOCKER_2003,
    'Docker CLI not found. Ensure Docker Desktop is installed or set DOCKER_PATH to the Docker binary.'
  )
}

export function dockerContainerNotRunningError(containerName: string): AppError {
  return createError(ErrorCode.DOCKER_2004, `Container ${containerName} is not running`)
}

export function dockerHealthCheckFailedError(containerName: string, maxRetries: number): AppError {
  return createError(
    ErrorCode.DOCKER_2005,
    `Container ${containerName} health check failed after ${maxRetries} attempts`
  )
}

export function dockerImagePullError(imageName: string, originalMessage: string): AppError {
  return createError(ErrorCode.DOCKER_2006, `Failed to pull image ${imageName}: ${originalMessage}`)
}

// ==================== MINING WORKER ERRORS ====================

export function miningCrawlerInitError(originalMessage: string): AppError {
  return createError(
    ErrorCode.MINING_3001,
    `Failed to initialize crawler service: ${originalMessage}`
  )
}

export function miningAssignmentAlreadyStartedError(assignmentId: string): AppError {
  return createError(ErrorCode.MINING_3002, `Assignment ${assignmentId} already started`)
}

export function miningPlatformMismatchError(assignmentId: string): AppError {
  return createError(
    ErrorCode.MINING_3003,
    `Assignment ${assignmentId}: platform not in worker preferences`
  )
}

export function miningTaskNotAssignableError(assignmentId: string): AppError {
  return createError(
    ErrorCode.MINING_3004,
    `Assignment ${assignmentId}: task not in assignable state`
  )
}

export function miningAssignmentNotFoundError(assignmentId: string): AppError {
  return createError(ErrorCode.MINING_3005, `Assignment ${assignmentId} not found`)
}

export function miningNotAuthorizedError(assignmentId: string): AppError {
  return createError(ErrorCode.MINING_3006, `Not authorized to start assignment ${assignmentId}`)
}

export function miningServerError(assignmentId: string, status: number): AppError {
  return createError(
    ErrorCode.MINING_3007,
    `Server error (${status}) for assignment ${assignmentId}`
  )
}

export function miningNetworkError(errorCode: string): AppError {
  return createError(ErrorCode.MINING_3008, `Network error: ${errorCode}`)
}

export function miningNoUrlError(assignmentId: string): AppError {
  return createError(ErrorCode.MINING_3009, `No URL found for assignment ${assignmentId}`)
}

export function miningNoContentError(assignmentId: string): AppError {
  return createError(ErrorCode.MINING_3010, `No content crawled for assignment ${assignmentId}`)
}

export function miningSSEError(originalMessage: string): AppError {
  return createError(ErrorCode.MINING_3011, `SSE connection failed: ${originalMessage}`)
}

export function miningConflictError(assignmentId: string, reason: string): AppError {
  return createError(
    ErrorCode.MINING_3017,
    `Conflict starting assignment ${assignmentId}: ${reason}`
  )
}

export function miningPreferencesError(originalMessage: string): AppError {
  return createError(ErrorCode.MINING_3012, `Failed to set worker preferences: ${originalMessage}`)
}

export function miningHeartbeatError(originalMessage: string): AppError {
  return createError(ErrorCode.MINING_3013, `Heartbeat failed: ${originalMessage}`)
}

export function miningHeartbeatMissingInfoError(): AppError {
  return createError(ErrorCode.MINING_3014, 'Skipping heartbeat - missing user or device ID')
}

export function miningSubmitError(assignmentId: string, originalMessage: string): AppError {
  return createError(
    ErrorCode.MINING_3015,
    `Failed to submit assignment ${assignmentId}: ${originalMessage}`
  )
}

export function miningAbandonError(assignmentId: string, originalMessage: string): AppError {
  return createError(
    ErrorCode.MINING_3016,
    `Failed to abandon assignment ${assignmentId}: ${originalMessage}`
  )
}

// ==================== CRAWLER ERRORS ====================

export function crawlerNotInitializedError(): AppError {
  return createError(ErrorCode.CRAWLER_4001, 'Crawler service not initialized (baseUrl not set)')
}

export function crawlerHealthCheckTimeoutError(): AppError {
  return createError(ErrorCode.CRAWLER_4002, 'Health check timeout during initialization')
}

export function crawlerSessionCreateError(originalMessage: string): AppError {
  return createError(ErrorCode.CRAWLER_4003, `Failed to create crawler session: ${originalMessage}`)
}

export function crawlerCrawlFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.CRAWLER_4004, `Crawl operation failed: ${originalMessage}`)
}

export function crawlerRestartFailedError(originalMessage: string): AppError {
  return createError(
    ErrorCode.CRAWLER_4005,
    `Failed to restart crawler service: ${originalMessage}`
  )
}

export function crawlerServiceUrlError(): AppError {
  return createError(ErrorCode.CRAWLER_4008, 'Failed to get crawler service URL')
}

export function crawlerNotHealthyError(): AppError {
  return createError(ErrorCode.CRAWLER_4009, 'Crawler service is not healthy')
}

export function crawlerSessionDestroyError(originalMessage: string): AppError {
  return createError(
    ErrorCode.CRAWLER_4006,
    `Failed to destroy crawler session: ${originalMessage}`
  )
}

export function crawlerCloseError(originalMessage: string): AppError {
  return createError(ErrorCode.CRAWLER_4007, `Failed to close crawler service: ${originalMessage}`)
}

export function crawlerEndpointResolveError(): AppError {
  return createError(ErrorCode.CRAWLER_4010, 'Failed to resolve crawler endpoint after restart')
}

// ==================== UPTIME ERRORS ====================

export function uptimeUserInfoMissingError(): AppError {
  return createError(ErrorCode.UPTIME_5001, 'Cannot report cycle - user information not available')
}

export function uptimeCycleTooShortError(duration: number): AppError {
  return createError(
    ErrorCode.UPTIME_5002,
    `Cycle duration too short (${duration}ms) - skipping report`
  )
}

export function uptimeReportFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.UPTIME_5003, `Failed to report uptime: ${originalMessage}`)
}

export function uptimeRewardParseError(originalMessage: string): AppError {
  return createError(ErrorCode.UPTIME_5004, `Failed to parse reward response: ${originalMessage}`)
}

export function uptimeTickError(originalMessage: string): AppError {
  return createError(ErrorCode.UPTIME_5005, `Uptime tick error: ${originalMessage}`)
}

// ==================== DEVICE ERRORS ====================

export function deviceNoUserError(): AppError {
  return createError(ErrorCode.DEVICE_6001, 'Cannot register device without an authenticated user')
}

export function deviceRegistrationFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.DEVICE_6002, `Failed to register device: ${originalMessage}`)
}

export function deviceIdMissingError(): AppError {
  return createError(ErrorCode.DEVICE_6003, 'Device ID missing in server response')
}

export function deviceResponseDecodeError(originalMessage: string): AppError {
  return createError(
    ErrorCode.DEVICE_6004,
    `Failed to decode device registration response: ${originalMessage}`
  )
}

// ==================== NODE RUNTIME ERRORS ====================

export function nodeStartFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.NODE_7001, `Node runtime failed to start: ${originalMessage}`)
}

export function nodeStopFailedError(originalMessage: string): AppError {
  return createError(ErrorCode.NODE_7002, `Node runtime failed to stop: ${originalMessage}`)
}

// ==================== UNKNOWN ERRORS ====================

export function unknownError(originalMessage: string): AppError {
  return createError(ErrorCode.UNKNOWN_ERROR, `Unknown error: ${originalMessage}`)
}
