import { app } from 'electron'
import electronLog from 'electron-log'
import fs from 'fs'
import path from 'path'
import { getErrorMessage } from '../utils/get-error-message'

// Configure the logger
const setupLogger = () => {
  // Define log directory
  const logDir = app.getPath('logs')
  const currentLogPath = path.join(logDir, 'log.log')
  const maxLogFiles = 10

  // Make sure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  // Set the log file location
  electronLog.transports.file.resolvePathFn = () => currentLogPath

  // Configure file transport
  electronLog.transports.file.maxSize = 10 * 1024 * 1024 // 10MB

  // Configure file rotation with timestamp suffix
  electronLog.transports.file.archiveLogFn = (oldLogFile) => {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace(/T/, '_')

    const dirName = path.dirname(oldLogFile.path)
    const newFileName = `log-${timestamp}.log`
    const newPath = path.join(dirName, newFileName)

    return newPath
  }

  // Configure cleanup function to keep the newest 10 log files
  const cleanupOldLogs = async () => {
    try {
      const files = await fs.promises.readdir(logDir)

      const logFiles = await Promise.all(
        files
          .filter(
            (file) =>
              file === 'log.log' || /^log-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.log$/.test(file)
          )
          .map(async (file) => {
            const filePath = path.join(logDir, file)
            try {
              const stats = await fs.promises.stat(filePath)
              return { filePath, mtime: stats.mtime.getTime() }
            } catch (statErr) {
              console.error(
                `Error getting stats for ${filePath}:`,
                getErrorMessage(statErr, 'Error getting stats for log file')
              )
              return null
            }
          })
      )

      const validLogFiles = logFiles.filter(
        (logFile): logFile is { filePath: string; mtime: number } => !!logFile
      )

      if (validLogFiles.length <= maxLogFiles) {
        return
      }

      const filesToDelete = validLogFiles.sort((a, b) => b.mtime - a.mtime).slice(maxLogFiles)

      await Promise.all(
        filesToDelete.map(async ({ filePath }) => {
          try {
            await fs.promises.unlink(filePath)
          } catch (unlinkErr) {
            console.error(
              `Error deleting old log file ${filePath}:`,
              getErrorMessage(unlinkErr, 'Error deleting old log file')
            )
          }
        })
      )
    } catch (err) {
      console.error(
        'Error cleaning up log directory:',
        getErrorMessage(err, 'Error cleaning up log directory')
      )
    }
  }

  // Run cleanup on startup
  cleanupOldLogs().catch((err) => {
    console.error(
      'Error running startup log cleanup:',
      getErrorMessage(err, 'Error running startup log cleanup')
    )
  })

  // Schedule cleanup to run daily
  setInterval(
    () => {
      cleanupOldLogs().catch((err) => {
        console.error(
          'Error running scheduled log cleanup:',
          getErrorMessage(err, 'Error running scheduled log cleanup')
        )
      })
    },
    24 * 60 * 60 * 1000
  )

  return electronLog
}

// Create and export the logger
const logger = setupLogger()

export default logger
