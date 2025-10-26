import { ipcRenderer } from 'electron'
import type { BugReportSubmissionResult, SubmitBugReportPayload } from '../../api/reports/types'
import { ReportsEvents } from './events'

type SubmitResult =
  | { success: true; result: BugReportSubmissionResult }
  | { success: false; error: string }

export const reportsIPC = {
  submit(payload: SubmitBugReportPayload): Promise<SubmitResult> {
    return ipcRenderer.invoke(ReportsEvents.Submit, payload)
  }
}

export type ReportsIPC = typeof reportsIPC
