import axios from 'axios'
import { isAppError, type AppError } from '../errors/error-codes'

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const getErrorMessage = (error: any, defaultMessage?: string): string => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data
    const message = serverError?.message || error.message || defaultMessage
    return message
  }

  if (isAppError(error)) {
    return (error as AppError).message || defaultMessage || 'Unknown error'
  }

  if (error instanceof Error) {
    return error.message || defaultMessage || 'Unknown error'
  }

  if (typeof error === 'string') {
    return error || defaultMessage || 'Unknown error'
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message || defaultMessage || 'Unknown error'
  }

  return defaultMessage || safeStringify(error) || 'Unknown error'
}
