/**
 * Error Code System for OptimAI Core Node
 *
 * Format: CATEGORY_NNNN where:
 * - CATEGORY: Error category (AUTH, DOCKER, MINING, etc.)
 * - NNNN: Numeric code within category
 */

export enum ErrorCode {
  // ==================== AUTHENTICATION (AUTH_10xx) ====================
  /** No authentication tokens available when starting node */
  AUTH_1001 = 'AUTH_1001',
  /** Failed to fetch user profile from API */
  AUTH_1002 = 'AUTH_1002',
  /** User payload missing from API response */
  AUTH_1003 = 'AUTH_1003',
  /** No refresh token available for token refresh */
  AUTH_1004 = 'AUTH_1004',
  /** Token refresh request failed */
  AUTH_1005 = 'AUTH_1005',

  // ==================== DOCKER (DOCKER_20xx) ====================
  /** Docker is not installed on the system */
  DOCKER_2001 = 'DOCKER_2001',
  /** Docker daemon is not running */
  DOCKER_2002 = 'DOCKER_2002',
  /** Docker CLI binary not found in PATH */
  DOCKER_2003 = 'DOCKER_2003',
  /** Docker container is not running */
  DOCKER_2004 = 'DOCKER_2004',
  /** Container health check failed after max retries */
  DOCKER_2005 = 'DOCKER_2005',
  /** Failed to pull Docker image */
  DOCKER_2006 = 'DOCKER_2006',
  /** Failed to run Docker container */
  DOCKER_2007 = 'DOCKER_2007',
  /** Failed to start Docker container */
  DOCKER_2008 = 'DOCKER_2008',
  /** Failed to stop Docker container */
  DOCKER_2009 = 'DOCKER_2009',
  /** Failed to restart Docker container */
  DOCKER_2010 = 'DOCKER_2010',
  /** Failed to remove Docker container */
  DOCKER_2011 = 'DOCKER_2011',
  /** Failed to get container status */
  DOCKER_2012 = 'DOCKER_2012',
  /** Failed to execute command in container */
  DOCKER_2013 = 'DOCKER_2013',
  /** Failed to get container logs */
  DOCKER_2014 = 'DOCKER_2014',
  /** Failed to list Docker containers */
  DOCKER_2015 = 'DOCKER_2015',

  // ==================== MINING WORKER (MINING_30xx) ====================
  /** Failed to initialize crawler service */
  MINING_3001 = 'MINING_3001',
  /** Assignment already started (HTTP 409) */
  MINING_3002 = 'MINING_3002',
  /** Platform not in worker preferences (HTTP 409) */
  MINING_3003 = 'MINING_3003',
  /** Task not in assignable state (HTTP 409) */
  MINING_3004 = 'MINING_3004',
  /** Assignment not found (HTTP 404) */
  MINING_3005 = 'MINING_3005',
  /** Not authorized to start assignment (HTTP 403) */
  MINING_3006 = 'MINING_3006',
  /** Server error when starting assignment (HTTP 5xx) */
  MINING_3007 = 'MINING_3007',
  /** Network error (ECONNREFUSED, ETIMEDOUT, etc.) */
  MINING_3008 = 'MINING_3008',
  /** No URL found in assignment */
  MINING_3009 = 'MINING_3009',
  /** No content crawled from URL */
  MINING_3010 = 'MINING_3010',
  /** SSE connection failed */
  MINING_3011 = 'MINING_3011',
  /** Failed to set worker preferences */
  MINING_3012 = 'MINING_3012',
  /** Heartbeat failed */
  MINING_3013 = 'MINING_3013',
  /** Missing user or device ID for heartbeat */
  MINING_3014 = 'MINING_3014',
  /** Assignment submission failed */
  MINING_3015 = 'MINING_3015',
  /** Assignment abandon failed */
  MINING_3016 = 'MINING_3016',
  /** Generic conflict when starting assignment */
  MINING_3017 = 'MINING_3017',

  // ==================== CRAWLER (CRAWLER_40xx) ====================
  /** Crawler service not initialized (baseUrl not set) */
  CRAWLER_4001 = 'CRAWLER_4001',
  /** Health check timeout during initialization */
  CRAWLER_4002 = 'CRAWLER_4002',
  /** Failed to create crawler session */
  CRAWLER_4003 = 'CRAWLER_4003',
  /** Crawl operation failed */
  CRAWLER_4004 = 'CRAWLER_4004',
  /** Failed to restart crawler service */
  CRAWLER_4005 = 'CRAWLER_4005',
  /** Failed to destroy crawler session */
  CRAWLER_4006 = 'CRAWLER_4006',
  /** Failed to close crawler service */
  CRAWLER_4007 = 'CRAWLER_4007',
  /** Failed to get crawler service URL */
  CRAWLER_4008 = 'CRAWLER_4008',
  /** Crawler service not healthy after operation */
  CRAWLER_4009 = 'CRAWLER_4009',
  /** Failed to resolve crawler endpoint after restart */
  CRAWLER_4010 = 'CRAWLER_4010',

  // ==================== UPTIME (UPTIME_50xx) ====================
  /** User information not available for uptime report */
  UPTIME_5001 = 'UPTIME_5001',
  /** Cycle duration too short (≤1 second) */
  UPTIME_5002 = 'UPTIME_5002',
  /** Failed to report uptime to API */
  UPTIME_5003 = 'UPTIME_5003',
  /** Failed to decode/parse reward response */
  UPTIME_5004 = 'UPTIME_5004',
  /** Uptime tick error */
  UPTIME_5005 = 'UPTIME_5005',

  // ==================== DEVICE (DEVICE_60xx) ====================
  /** Cannot register device without authenticated user */
  DEVICE_6001 = 'DEVICE_6001',
  /** Device registration API request failed */
  DEVICE_6002 = 'DEVICE_6002',
  /** Device ID missing in server response */
  DEVICE_6003 = 'DEVICE_6003',
  /** Failed to decode device registration response */
  DEVICE_6004 = 'DEVICE_6004',

  // ==================== NODE RUNTIME (NODE_70xx) ====================
  /** Node runtime failed to start */
  NODE_7001 = 'NODE_7001',
  /** Node runtime failed to stop */
  NODE_7002 = 'NODE_7002',

  // ==================== CRAWL4AI SERVICE (CRAWL4AI_80xx) ====================
  /** Failed to initialize Crawl4AI container */
  CRAWL4AI_8001 = 'CRAWL4AI_8001',
  /** Failed to stop Crawl4AI container */
  CRAWL4AI_8002 = 'CRAWL4AI_8002',
  /** Failed to restart Crawl4AI container */
  CRAWL4AI_8003 = 'CRAWL4AI_8003',
  /** Failed to check Crawl4AI container status */
  CRAWL4AI_8004 = 'CRAWL4AI_8004',

  // ==================== GENERIC/UNKNOWN (UNKNOWN_99xx) ====================
  /** Unknown or uncategorized error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Application error with structured code and message
 */
export interface AppError {
  /** Standardized error code */
  code: ErrorCode
  /** Original technical error message for debugging */
  message: string
}

/**
 * Creates a standardized AppError
 */
export function createError(code: ErrorCode, message: string): AppError {
  return { code, message }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).message === 'string'
  )
}

/**
 * Converts any error to AppError
 */
export function toAppError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return createError(defaultCode, error.message)
  }

  if (typeof error === 'string') {
    return createError(defaultCode, error)
  }

  return createError(defaultCode, 'Unknown error occurred')
}

/**
 * Converts any error to a plain, serializable AppError payload.
 * Unlike `toAppError`, this never returns an `Error` instance.
 */
export function toAppErrorPayload(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): AppError {
  if (isAppError(error) && !(error instanceof Error)) {
    return error
  }

  if (error instanceof Error) {
    const code = (error as any)?.code
    if (typeof code === 'string') {
      return createError(code as ErrorCode, error.message)
    }
    return createError(defaultCode, error.message)
  }

  if (typeof error === 'string') {
    return createError(defaultCode, error)
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as any).message
    if (typeof message === 'string') {
      const code = (error as any).code
      if (typeof code === 'string') {
        return createError(code as ErrorCode, message)
      }
      return createError(defaultCode, message)
    }
  }

  return createError(defaultCode, 'Unknown error occurred')
}
