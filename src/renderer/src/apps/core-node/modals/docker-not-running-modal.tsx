import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)

  return (
    <Dialog open={open}>
      <DialogContent
        className={cn('overflow-hidden sm:max-w-sm')}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Content />
      </DialogContent>
    </Dialog>
  )
}

function Content() {
  const { onRetry: onComplete } = useModalData(Modals.DOCKER_NOT_RUNNING)

  useEffect(() => {
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
  }, [onComplete])

  return (
    <div className="flex h-full flex-col">
      <motion.div
        key="instructions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="bg-destructive/10 mx-auto mb-6 flex size-18 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive size-7" />
        </div>
        <h3 className="text-20 font-semibold text-white">Please open Docker Desktop</h3>
        <p className="text-16 mt-1 text-balance text-white/50">
          Open Docker Desktop from your Applications/Start menu and keep it running. We’ll continue
          once it’s ready.
        </p>
      </motion.div>

      <div className="space-y-2 pt-15">
        <Button
          disabled
          className="from-yellow to-green w-full bg-gradient-to-r text-black hover:opacity-90 disabled:opacity-50"
        >
          <Icon icon="LoaderCircle" className="size-4 animate-spin" />
          Checking Docker...
        </Button>
        <Button
          variant="outline"
          className="text-12 h-auto w-full text-white/60 hover:text-white"
          onClick={() => window.windowIPC.openExternalLink('https://docs.docker.com/desktop/')}
        >
          Get help
        </Button>
      </div>
    </div>
  )
}
