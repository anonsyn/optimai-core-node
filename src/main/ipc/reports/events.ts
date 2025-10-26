export const ReportsEvents = {
  Submit: 'reports:submit'
} as const

export type ReportsEvent = (typeof ReportsEvents)[keyof typeof ReportsEvents]
