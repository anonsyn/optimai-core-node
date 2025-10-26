import { ipcMain } from 'electron'
import { z } from 'zod'
import log from '../../configs/logger'
import { getErrorMessage } from '../../utils/get-error-message'
import { reportsService } from '../../services/reports-service'
import { ReportsEvents } from './events'

const submitPayloadSchema = z.object({
  email: z.string().email().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000)
})

class ReportsIpcHandler {
  initialize() {
    ipcMain.handle(ReportsEvents.Submit, async (_event, rawPayload) => {
      const parsed = submitPayloadSchema.safeParse(rawPayload)

      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return {
          success: false as const,
          error: issue?.message ?? 'Invalid bug report payload'
        }
      }

      try {
        const result = await reportsService.submitBugReport(parsed.data)
        return {
          success: true as const,
          result
        }
      } catch (error) {
        const message = getErrorMessage(error, 'Failed to submit bug report')
        log.error('[reports] Failed to submit via IPC', message)
        return {
          success: false as const,
          error: message
        }
      }
    })
  }
}

const reportsIpcHandler = new ReportsIpcHandler()

export default reportsIpcHandler
