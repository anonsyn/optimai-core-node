import { isAppError, type AppError } from '../errors/error-codes'

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * p-retry and many Promise chains expect thrown values to be `Error` instances.
 * This helper converts AppError payloads (and other unknown throwables) into `Error`.
 */
export function ensureError(error: unknown, defaultMessage = 'Unknown error'): Error {
  if (error instanceof Error) {
    return error
  }

  if (isAppError(error)) {
    const appError = error as AppError
    const wrapped = new Error(appError.message) as Error & { code?: string }
    wrapped.name = 'AppError'
    wrapped.code = appError.code
    return wrapped
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as any).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return new Error(message)
    }
  }

  return new Error(safeStringify(error) || defaultMessage)
}

