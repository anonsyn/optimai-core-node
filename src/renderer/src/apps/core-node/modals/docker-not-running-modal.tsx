import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)

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
  const modalData = useModalData(Modals.DOCKER_NOT_RUNNING)
  const { onRetry: onComplete, autoCheck = true } = modalData || {}
  const [isChecking, setIsChecking] = useState(autoCheck)

  const handleManualCheck = () => {
    setIsChecking(true)
  }

  useEffect(() => {
    if (!isChecking) return

    let cancelled = false
    let interval: NodeJS.Timeout | null = null

    const pollDocker = async () => {
      if (cancelled) return

      try {
        const isRunning = await window.dockerIPC.checkRunning()

        if (cancelled) {
          return
        }

        if (isRunning) {
          onComplete?.()
          if (interval) {
            clearInterval(interval)
            interval = null
          }
        }
      } catch (error) {
        console.error('Docker running verification failed:', error)
      }
    }

    pollDocker()
    interval = setInterval(pollDocker, 5000)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [onComplete, isChecking])

  return (
    <div className="flex h-full flex-col">
      <motion.div
        key="instructions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full border border-white/10 bg-black/30">
          <Icon className="size-7 shrink-0 text-white" icon="Docker" />
        </div>
        <h3 className="text-20 font-semibold text-white">Please Open Docker</h3>
        <p className="text-16 mt-1 text-white/50">
          To power your node, make sure Docker is open and running in the background
        </p>
      </motion.div>

      <div className="space-y-2 pt-15">
        <Button
          disabled={isChecking}
          onClick={isChecking ? undefined : handleManualCheck}
          className="from-yellow to-green w-full bg-gradient-to-r text-black hover:opacity-90 disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Checking Docker...
            </>
          ) : (
            'Check Docker'
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.windowIPC.openExternalLink('https://docs.docker.com/desktop/')}
        >
          Get help
        </Button>
      </div>
    </div>
  )
}
