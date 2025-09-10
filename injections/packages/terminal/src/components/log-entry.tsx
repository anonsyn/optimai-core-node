import { cn } from '@xagent/utils'
import type { LogEntry } from '../providers/terminal'

interface LogEntryProps {
  log: LogEntry
}

export const LogEntryComponent = ({ log }: LogEntryProps) => {
  const getLevelStyles = () => {
    switch (log.level) {
      case 'success':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'loading':
        return 'bg-warning/10 text-warning/90 border-warning/20'
      default:
        return 'bg-white/5 text-white/60 border-white/10'
    }
  }

  const getMessageColor = () => {
    switch (log.level) {
      case 'success':
        return 'text-primary/80'
      case 'error':
        return 'text-destructive/80'
      case 'warning':
        return 'text-warning/80'
      case 'loading':
        return 'text-warning/70'
      default:
        return 'text-white/60'
    }
  }

  const getLevelText = () => {
    switch (log.level) {
      case 'success':
        return 'SUCCESS'
      case 'error':
        return 'ERROR'
      case 'warning':
        return 'WARNING'
      case 'loading':
        return 'LOADING'
      default:
        return 'INFO'
    }
  }

  return (
    <div
      className={cn(
        'flex gap-3 py-2 items-start',
        'border-l-2 border-transparent pl-3 -ml-2',
        'transition-all duration-200',
        log.animated && 'waiting-animation'
      )}
    >
      <span className="text-[10px] text-white/60 min-w-[55px] mt-1 font-mono tracking-wider">
        {log.timestamp.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}
      </span>
      <span
        className={cn(
          'text-[9px] px-2 py-0.5 mt-[2px] rounded font-bold tracking-wider border',
          'min-w-[60px] text-center',
          getLevelStyles()
        )}
      >
        {getLevelText()}
      </span>
      <span className={cn('flex-1 break-words text-[13px] leading-[20px]', getMessageColor())}>
        {log.message}
        {log.animated && (
          <span className="waiting-dots inline-flex ml-1 text-warning/60">
            <span className="dot-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </span>
        )}
      </span>
    </div>
  )
}
