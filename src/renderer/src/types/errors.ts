/**
 * Application error type for renderer
 * Matches the AppError interface from main process
 */
export interface AppError {
  /** Standardized error code (e.g., AUTH_1001, MINING_3001) */
  code: string
  /** Original technical error message for debugging */
  message: string
}
