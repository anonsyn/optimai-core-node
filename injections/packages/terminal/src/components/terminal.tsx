import { cn } from '@xagent/utils'
import { useEffect, useRef } from 'react'
import { useTerminalState } from '../providers/terminal'
import { Header } from './header'
import { LogEntryComponent } from './log-entry'

interface TerminalProps {
  title?: string
  emptyMessage?: string
  className?: string
}

export const Terminal = ({
  title = 'Agent Terminal',
  emptyMessage = 'No activity yet',
  className
}: TerminalProps) => {
  const { logs, isProcessing } = useTerminalState()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollContainerRef.current && logs.length > 0) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [logs])

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 w-[420px] max-h-[600px]',
        'bg-brown/90 border border-white/10 rounded-xl shadow-2xl',
        'terminal-enter pointer-events-auto z-50 backdrop-blur-lg',
        className
      )}
    >
      <Header isProcessing={isProcessing} title={title} />

      <div
        ref={scrollContainerRef}
        className="p-4 max-h-[500px] overflow-y-auto font-mono text-[14px] scrollable"
      >
        {logs.length === 0 ? (
          <div className="text-white/60 text-center py-8">{emptyMessage}</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => (
              <LogEntryComponent key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
