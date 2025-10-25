export type EventSeverity = 'critical' | 'error' | 'warning' | 'info'

export interface ReportEventRequest {
  source: string
  clientId?: string
  eventId: string
  type: string
  severity: EventSeverity
  message: string
  metadata?: Record<string, unknown>
  ts?: string
}

export interface ReportEventResponse {
  status: 'queued' | 'duplicate'
  ingestionId?: string
  eventId: string
}
