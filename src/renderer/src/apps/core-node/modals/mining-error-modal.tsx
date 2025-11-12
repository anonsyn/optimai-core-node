import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function MiningErrorModal() {
  const open = useIsModalOpen(Modals.MINING_ERROR)

  return (
    <Dialog open={open}>
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
    return `Error: ${error?.message || 'UNKNOWN_ERROR'}`
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
        <div className="bg-destructive/10 mx-auto mb-6 flex size-18 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive size-7" />
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
      </div>
    </div>
  )
}
