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
        'fixed right-4 bottom-4 max-h-[600px] w-[420px]',
        'bg-brown/90 rounded-xl border border-white/10 shadow-2xl',
        'terminal-enter pointer-events-auto z-50 backdrop-blur-lg',
        className
      )}
    >
      <Header isProcessing={isProcessing} title={title} />

      <div
        ref={scrollContainerRef}
        className="scrollable max-h-[500px] overflow-y-auto p-4 font-mono text-[14px]"
      >
        {logs.length === 0 ? (
          <div className="py-8 text-center text-white/60">{emptyMessage}</div>
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
