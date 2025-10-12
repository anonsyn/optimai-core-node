import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { SetupStep } from './setup-step'

export function DockerNotInstalledModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_INSTALLED)
  const data = useModalData(Modals.DOCKER_NOT_INSTALLED)

  const handleComplete = () => {
    setTimeout(() => {
      if (data?.onRetry) {
        data.onRetry()
      }
    }, 300)
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="overflow-hidden sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <motion.div
          key="installation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SetupStep onComplete={handleComplete} />
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
