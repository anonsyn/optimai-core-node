import { useCloseModal, useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { nodeSelectors } from '@/store/slices/node'
import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AssignmentsList } from './assignments'

interface MiningOperationalProps {
  status: MiningWorkerStatus
}

export const MiningOperational = ({ status }: MiningOperationalProps) => {
  const openMiningError = useOpenModal(Modals.MINING_ERROR)
  const openDockerErrorModal = useOpenModal(Modals.DOCKER_NOT_RUNNING)
  const closeMiningError = useCloseModal(Modals.MINING_ERROR)
  const closeDockerModal = useCloseModal(Modals.DOCKER_NOT_RUNNING)
  const miningError = useSelector(nodeSelectors.miningError)

  useEffect(() => {
    // Open/close modal based on mining status
    if (status.status === MiningStatus.Error) {
      if (miningError) {
        const isDockerError = miningError.code.startsWith('DOCKER_')
        if (isDockerError) {
          openDockerErrorModal({
            onRetry: async () => closeDockerModal(),
            autoCheck: false,
            canDismiss: true
          })
        } else {
          openMiningError({ error: miningError })
        }
      }
    } else {
      // Close modal when mining is operational
      closeMiningError()
      closeDockerModal()
    }
  }, [
    status.status,
    miningError,
    openMiningError,
    closeMiningError,
    openDockerErrorModal,
    closeDockerModal
  ])

  return (
    <div className="relative h-full w-full">
      {/* Base assignments list */}
      <AssignmentsList />
    </div>
  )
}
