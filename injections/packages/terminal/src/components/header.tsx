import { cn } from '@xagent/utils'
import { useTerminalApi } from '../providers/terminal'

interface HeaderProps {
  isProcessing: boolean
  title?: string
}

export const Header = ({ isProcessing, title = 'Agent Terminal' }: HeaderProps) => {
  const { clearLogs } = useTerminalApi()

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        'bg-brown/80  border-b border-white/10 rounded-t-xl',
        'backdrop-blur-sm'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[14px] font-medium text-white/90">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {isProcessing && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[12px] text-white/60">Processing</span>
          </div>
        )}
        <button
          onClick={clearLogs}
          className={cn(
            'px-2.5 py-1 text-[12px] font-medium text-white/70',
            'bg-white/10 hover:bg-white/20 rounded-md',
            'transition-colors duration-200',
            'hover:text-white/90'
          )}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
