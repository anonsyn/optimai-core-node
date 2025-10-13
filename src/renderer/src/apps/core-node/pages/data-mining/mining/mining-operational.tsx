import { useCloseModal, useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { useEffect } from 'react'
import { AssignmentsList } from './assignments'

interface MiningOperationalProps {
  status: MiningWorkerStatus
}

export const MiningOperational = ({ status }: MiningOperationalProps) => {
  const openMiningStopped = useOpenModal(Modals.MINING_STOPPED)
  const openMiningError = useOpenModal(Modals.MINING_ERROR)
  const closeMiningStopped = useCloseModal(Modals.MINING_STOPPED)
  const closeMiningError = useCloseModal(Modals.MINING_ERROR)

  useEffect(() => {
    // Open/close modals based on mining status
    if (status.status === MiningStatus.Error) {
      openMiningError({ error: status.lastError || 'An error occurred' })
      closeMiningStopped()
    } else if (status.status === MiningStatus.Stopped) {
      openMiningStopped()
      closeMiningError()
    } else if (status.status === MiningStatus.Ready || status.status === MiningStatus.Processing) {
      // Close both modals when mining is operational
      closeMiningStopped()
      closeMiningError()
    }
  }, [
    status.status,
    status.lastError,
    openMiningError,
    openMiningStopped,
    closeMiningError,
    closeMiningStopped
  ])

  return (
    <div className="relative h-full w-full">
      {/* Base assignments list */}
      <AssignmentsList />
    </div>
  )
}
