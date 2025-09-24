import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { AnimatePresence } from 'framer-motion'
import { AssignmentsList } from './assignments'
import { ErrorOverlay } from './overlays/error-overlay'
import { StoppedOverlay } from './overlays/stopped-overlay'

interface MiningOperationalProps {
  status: MiningWorkerStatus
}

export const MiningOperational = ({ status }: MiningOperationalProps) => {
  return (
    <div className="relative h-full w-full">
      {/* Base assignments list */}
      <AssignmentsList />

      {/* Overlays based on status */}
      <AnimatePresence>
        {status.status === MiningStatus.Error && (
          <ErrorOverlay error={status.lastError || 'An error occurred'} />
        )}
        {status.status === MiningStatus.Stopped && <StoppedOverlay />}
      </AnimatePresence>
    </div>
  )
}
