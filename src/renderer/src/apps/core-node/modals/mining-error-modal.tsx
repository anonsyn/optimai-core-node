import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useCloseModal, useIsModalOpen, useModalData, useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function MiningErrorModal() {
  const open = useIsModalOpen(Modals.MINING_ERROR)

  const closeModal = useCloseModal(Modals.MINING_ERROR)

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent
        className="overflow-hidden sm:max-w-[452px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Content />
      </DialogContent>
    </Dialog>
  )
}

function Content() {
  const { error } = useModalData(Modals.MINING_ERROR)
  const [isRetrying, setIsRetrying] = useState(false)

  const openReportIssueModal = useOpenModal(Modals.REPORT_ISSUE)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await window.nodeIPC.restartMining()
    } catch (error) {
      console.error('Failed to restart mining:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Just show the error code
  const getErrorMessage = () => {
    return `Error: ${error?.code || error?.message || 'UNKNOWN_ERROR'}`
  }

  return (
    <div className="flex h-full flex-col">
      <motion.div
        key="error"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full border border-black/20 bg-[#202522]">
          <div className="bg-background flex size-13 items-center justify-center rounded-full">
            <AlertTriangle className="size-6 text-white" />
          </div>
        </div>
        <h3 className="text-20 font-semibold text-white">Mining Error</h3>
        <p className="text-16 mt-1 text-white/70">{getErrorMessage()}</p>
      </motion.div>

      <div className="space-y-2 pt-15">
        <Button onClick={handleRetry} disabled={isRetrying} className="w-full">
          {isRetrying ? (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Trying again...
            </>
          ) : (
            <>
              <Icon icon="RotateCcw" className="size-4" />
              Try again
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            openReportIssueModal()
          }}
        >
          Report Issue
        </Button>
      </div>
    </div>
  )
}
