import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

export type LogLevel = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  animated?: boolean
}

export interface TerminalState {
  isVisible: boolean
  isProcessing: boolean
  logs: LogEntry[]
  maxLogs: number
}

export interface TerminalApi {
  show: () => void
  hide: () => void
  addLog: (message: string, level?: LogLevel, animated?: boolean) => void
  clearLogs: () => void
  setProcessing: (processing: boolean) => void
}

const TerminalStateContext = createContext<TerminalState>({
  isVisible: true,
  isProcessing: false,
  logs: [],
  maxLogs: 100
})

const TerminalApiContext = createContext<TerminalApi>({
  show: () => {},
  hide: () => {},
  addLog: () => {},
  clearLogs: () => {},
  setProcessing: () => {}
})

export const useTerminalState = () => {
  const context = useContext(TerminalStateContext)
  if (!context) {
    throw new Error('useTerminalState must be used within a TerminalProvider')
  }
  return context
}

export const useTerminalApi = () => {
  const context = useContext(TerminalApiContext)
  if (!context) {
    throw new Error('useTerminalApi must be used within a TerminalProvider')
  }
  return context
}

interface TerminalProviderProps {
  children: ReactNode
  maxLogs?: number
}

const STORAGE_KEY = 'terminal-logs'

export const TerminalProvider = ({ children, maxLogs = 100 }: TerminalProviderProps) => {
  // Load logs from localStorage on initial mount
  const loadLogsFromStorage = (): LogEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedLogs = JSON.parse(stored)
        // Convert timestamp strings back to Date objects and remove animations
        return parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          animated: false // Don't restore animations
        }))
      }
    } catch (error) {
      console.error('Failed to load logs from localStorage:', error)
    }
    return []
  }

  const [logs, setLogs] = useState<LogEntry[]>(loadLogsFromStorage)
  const [isVisible, setIsVisible] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      // Only store non-animated logs to avoid persisting temporary states
      const logsToStore = logs.map((log) => ({
        ...log,
        animated: false
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToStore))
    } catch (error) {
      console.error('Failed to save logs to localStorage:', error)
    }
  }, [logs])

  const addLog = useCallback(
    (message: string, level: LogLevel = 'info', animated: boolean = false) => {
      setLogs((prev) => {
        // Remove animation from all previous logs
        const updatedPrevLogs = prev.map((log) => ({ ...log, animated: false }))

        const newLog: LogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          timestamp: new Date(),
          level,
          message,
          animated: animated || level === 'loading'
        }
        const newLogs = [...updatedPrevLogs, newLog]
        return newLogs.length > maxLogs ? newLogs.slice(newLogs.length - maxLogs) : newLogs
      })
    },
    [maxLogs]
  )

  const clearLogs = useCallback(() => {
    setLogs([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear logs from localStorage:', error)
    }
  }, [])

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hide = useCallback(() => {
    setIsVisible(false)
  }, [])

  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing)
  }, [])

  const state = {
    isVisible,
    isProcessing,
    logs,
    maxLogs
  }

  const api = {
    show,
    hide,
    addLog,
    clearLogs,
    setProcessing
  }

  return (
    <TerminalStateContext.Provider value={state}>
      <TerminalApiContext.Provider value={api}>{children}</TerminalApiContext.Provider>
    </TerminalStateContext.Provider>
  )
}
