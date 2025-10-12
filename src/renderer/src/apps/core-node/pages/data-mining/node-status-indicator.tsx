import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { nodeSelectors } from '@/store/slices/node'
import { cn } from '@/utils/tw'
import { MiningStatus, NodeStatus } from '@main/node/types'
import { useSelector } from 'react-redux'

export const NodeStatusIndicator = () => {
  const status = useSelector(nodeSelectors.status)
  const lastError = useSelector(nodeSelectors.lastError)
  const miningStatus = useSelector(nodeSelectors.miningStatus)
  const isProcessing = useSelector(nodeSelectors.isMiningProcessing)

  const getStatusConfig = () => {
    // When node is running, check mining status
    if (status === NodeStatus.Running) {
      if (miningStatus?.status === MiningStatus.Processing || isProcessing) {
        return {
          label: 'Mining',
          dotClass: 'bg-green shadow-[0_0_12px_rgba(34,197,94,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-green',
          animate: true,
          tooltip: 'Mining data and earning rewards'
        }
      }

      if (
        miningStatus?.status === MiningStatus.Initializing ||
        miningStatus?.status === MiningStatus.InitializingCrawler
      ) {
        return {
          label: 'Initializing',
          dotClass: 'bg-yellow shadow-[0_0_12px_rgba(234,179,8,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-yellow',
          animate: true,
          tooltip: 'Initializing mining worker...'
        }
      }

      if (miningStatus?.status === MiningStatus.Error) {
        return {
          label: 'Error',
          dotClass: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-red-500',
          animate: false,
          tooltip: miningStatus?.lastError || 'Mining worker error'
        }
      }

      // Running but mining is Ready/Idle
      return {
        label: 'Active',
        dotClass: 'bg-green shadow-[0_0_12px_rgba(34,197,94,0.8)]',
        textClass: 'text-white',
        ringClass: 'bg-green',
        animate: true,
        tooltip: 'OptimAI is running and ready'
      }
    }

    // Other node states
    switch (status) {
      case NodeStatus.Starting:
        return {
          label: 'Starting up',
          dotClass: 'bg-yellow shadow-[0_0_12px_rgba(234,179,8,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-yellow',
          animate: true,
          tooltip: 'OptimAI is starting up...'
        }
      case NodeStatus.Stopping:
        return {
          label: 'Stopping',
          dotClass: 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-orange-500',
          animate: true,
          tooltip: 'OptimAI is stopping...'
        }
      case NodeStatus.Restarting:
        return {
          label: 'Restarting',
          dotClass: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
          textClass: 'text-white',
          ringClass: 'bg-blue-500',
          animate: true,
          tooltip: 'OptimAI is restarting...'
        }
      case NodeStatus.Idle:
      default:
        return {
          label: 'Offline',
          dotClass: 'bg-white/40',
          textClass: 'text-white/70',
          ringClass: 'bg-white/40',
          animate: false,
          tooltip: lastError || "OptimAI isn't running"
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
            className="bg-accent/30 hover:bg-accent/40 text-16 flex h-10 items-center gap-2.5 rounded-xl border border-white/5 px-4 transition-colors outline-none"
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
                    style={{
                      animationDuration: '2s'
                    }}
                  />
                </>
              )}
              {/* Status dot with enhanced glow */}
              <div className={cn('relative size-2 rounded-full', config.dotClass)} />
            </div>
            <span className={cn('font-medium', config.textClass)}>{config.label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="[z-index:60]">
          <p className="text-12">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
