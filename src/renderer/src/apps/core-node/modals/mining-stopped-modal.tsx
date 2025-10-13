import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function MiningStoppedModal() {
  const open = useIsModalOpen(Modals.MINING_STOPPED)

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
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await window.nodeIPC.restartMining()
    } catch (error) {
      console.error('Failed to start mining:', error)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <motion.div
        key="stopped"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="bg-destructive/10 mx-auto mb-6 flex size-14 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive size-6" />
        </div>
        <h3 className="text-20 font-semibold text-white">Mining Stopped</h3>
        <p className="text-16 mt-1 text-balance text-white/50">
          Mining is currently stopped. Start mining to begin processing assignments and earning
          rewards.
        </p>
      </motion.div>

      <div className="space-y-2 pt-15">
        <Button className="w-full" onClick={handleStart} disabled={isStarting}>
          {isStarting ? (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Icon icon="ArrowRight" className="size-4" />
              Start Mining
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
