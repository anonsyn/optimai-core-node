import axios from 'axios'

export const getErrorMessage = (error: any, defaultMessage?: string): string => {
  if (axios.isAxiosError(error)) {
    const serverError = error.response?.data
    const message = serverError?.message || error.message || defaultMessage
    return message
  }

  return error.message || defaultMessage
}
