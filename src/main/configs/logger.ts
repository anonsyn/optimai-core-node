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

  // Make sure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  // Set the log file location
  electronLog.transports.file.resolvePathFn = () => currentLogPath

  // Configure file transport
  electronLog.transports.file.maxSize = 5 * 1024 * 1024 // 5MB

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

  // Configure cleanup function for old logs (14 days)
  const cleanupOldLogs = () => {
    fs.readdir(logDir, (err, files) => {
      if (err) {
        console.error(
          'Error reading log directory:',
          getErrorMessage(err, 'Error reading log directory')
        )
        return
      }

      const now = new Date().getTime()
      const fourteenDaysInMs = 14 * 24 * 60 * 60 * 1000

      files.forEach((file) => {
        // Match archived log files (log-YYYY-MM-DD_HH-MM-SS.log)
        if (!file.match(/^log-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.log$/)) {
          return
        }

        const filePath = path.join(logDir, file)
        fs.stat(filePath, (statErr, stats) => {
          if (statErr) {
            console.error(
              `Error getting stats for ${filePath}:`,
              getErrorMessage(statErr, 'Error getting stats for log file')
            )
            return
          }

          const fileAge = now - stats.mtime.getTime()
          if (fileAge > fourteenDaysInMs) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(
                  `Error deleting old log file ${filePath}:`,
                  getErrorMessage(unlinkErr, 'Error deleting old log file')
                )
              }
            })
          }
        })
      })
    })
  }

  // Run cleanup on startup
  cleanupOldLogs()

  // Schedule cleanup to run daily
  setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000)

  return electronLog
}

// Create and export the logger
const logger = setupLogger()

export default logger
