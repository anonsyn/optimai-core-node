import { useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { nodeSelectors } from '@/store/slices/node'
import { cn } from '@/utils/tw'
import { MiningStatus } from '@main/node/types'
import { useSelector } from 'react-redux'

export const NodeStatusIndicator = () => {
  const isRunning = useSelector(nodeSelectors.isRunning)
  const miningStatus = useSelector(nodeSelectors.miningStatus)
  const miningError = useSelector(nodeSelectors.miningError)

  const openMiningError = useOpenModal(Modals.MINING_ERROR)
  const openDockerErrorModal = useOpenModal(Modals.DOCKER_NOT_RUNNING)

  const getStatusConfig = () => {
    // If node is not running, show offline
    if (!isRunning) {
      return {
        label: 'Offline',
        dotClass: 'bg-white/40',
        textClass: 'text-white/70',
        ringClass: 'bg-white/40',
        animate: false,
        tooltip: "OptimAI isn't running"
      }
    }

    // Node is running, show mining status
    if (miningStatus?.status === MiningStatus.Processing) {
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
        tooltip: miningError || 'Mining worker error'
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

  const config = getStatusConfig()

  const handleClick = () => {
    if (miningStatus?.status === MiningStatus.Error) {
      if (miningError) {
        const isDockerError = miningError.code.startsWith('DOCKER_')
        if (isDockerError) {
          openDockerErrorModal({
            onRetry: async () => {
              try {
                await window.nodeIPC.restartMining()
              } catch (error) {
                console.error('Failed to restart mining:', error)
              }
            },
            autoCheck: false,
            canDismiss: true
          })
        } else {
          openMiningError({ error: miningError })
        }
      }
    }
  }

  return (
    <button
      type="button"
      className="bg-accent/30 hover:bg-accent/40 text-16 flex h-10 items-center gap-2.5 rounded-xl border border-white/5 px-4 transition-colors outline-none"
      onClick={handleClick}
    >
      <div className="relative flex items-center justify-center">
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
        <div className={cn('relative size-2 rounded-full', config.dotClass)} />
      </div>
      <span className={cn('font-medium', config.textClass)}>{config.label}</span>
    </button>
  )
}
