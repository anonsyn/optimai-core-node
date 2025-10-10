import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { nodeSelectors } from '@/store/slices/node'
import { cn } from '@/utils/tw'
import { NodeStatus } from '@main/node/types'
import { useSelector } from 'react-redux'

export const NodeStatusIndicator = () => {
  const status = useSelector(nodeSelectors.status)
  const lastError = useSelector(nodeSelectors.lastError)

  const getStatusConfig = () => {
    switch (status) {
      case NodeStatus.Running:
        return {
          label: 'Running',
          dotClass: 'bg-green shadow-[0_0_12px_rgba(34,197,94,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-green',
          animate: true,
          tooltip: 'Node is running and earning rewards'
        }
      case NodeStatus.Starting:
        return {
          label: 'Starting',
          dotClass: 'bg-yellow shadow-[0_0_12px_rgba(234,179,8,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-yellow',
          animate: true,
          tooltip: 'Node is starting up...'
        }
      case NodeStatus.Stopping:
        return {
          label: 'Stopping',
          dotClass: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-orange-500',
          animate: true,
          tooltip: 'Node is shutting down...'
        }
      case NodeStatus.Restarting:
        return {
          label: 'Restarting',
          dotClass: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-blue-500',
          animate: true,
          tooltip: 'Node is restarting...'
        }
      case NodeStatus.Idle:
      default:
        return {
          label: 'Offline',
          dotClass: 'bg-white/40',
          textClass: 'text-white/70',
          ringClass: 'bg-white/40',
          animate: false,
          tooltip: lastError || 'Node is not running'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="hover:bg-accent/40 focus-visible:ring-primary text-13 focus-visible:ring-offset-background bg-accent/30 flex items-center gap-2 rounded-xl border border-white/5 px-4 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => {
              // You could add click action here to start/stop node
              console.log('Node status clicked:', status)
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Animated rings for active states - double pulse effect */}
              {config.animate && (
                <>
                  <div
                    className={cn(
                      'absolute size-3.5 animate-ping rounded-full opacity-30',
                      config.ringClass
                    )}
                  />
                  <div
                    className={cn(
                      'absolute size-2.5 animate-ping rounded-full opacity-50',
                      config.ringClass
                    )}
                    style={{ animationDelay: '150ms' }}
                  />
                </>
              )}
              {/* Status dot with enhanced glow */}
              <div className={cn('relative size-2 rounded-full', config.dotClass)} />
            </div>
            <span className={cn('font-medium', config.textClass)}>{config.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-12">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
