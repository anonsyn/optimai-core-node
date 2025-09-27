import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Clock, Container, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)
  const data = useModalData(Modals.DOCKER_NOT_RUNNING)
  const [isChecking, setIsChecking] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsChecking(false)
      setIsSuccess(false)
      setRetryError(null)
    }
  }, [open])

  const handleRetry = async () => {
    if (!data?.onRetry) {
      return
    }

    setRetryError(null)
    setIsChecking(true)
    try {
      const success = await data.onRetry()
      if (!success) {
        setRetryError(
          'Docker Desktop is still not running. Please make sure Docker is fully started.'
        )
      } else {
        setIsSuccess(true)
        // Auto-close after success animation
        setTimeout(() => {
          // The modal will be closed by the parent component
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to retry Docker runtime check:', error)
      setRetryError('Failed to check Docker status. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleQuit = () => {
    window.windowIPC.close()
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className={cn('overflow-hidden sm:max-w-xl', isSuccess && 'sm:max-w-md')}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with friendly greeting */}
              <DialogHeader className="relative">
                <div className="from-warning/20 to-primary/20 absolute -top-2 -right-2 size-20 rounded-full bg-gradient-to-br blur-3xl" />
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <DialogTitle className="text-20 text-start">Start Docker Desktop</DialogTitle>
                  <DialogDescription>
                    Docker Desktop is installed but not running.
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              {/* Main Content Area */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 space-y-4"
              >
                {/* Steps */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                      <PlayCircle className="text-primary size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-14 font-medium text-white">Step 1: Open Docker Desktop</p>
                      <p className="text-12 mt-0.5 text-white/60">
                        Launch Docker Desktop from your Applications or Start Menu
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                      <Clock className="text-primary size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-14 font-medium text-white">Step 2: Wait for Startup</p>
                      <p className="text-12 mt-0.5 text-white/60">
                        Docker takes 30-60 seconds to fully start
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                      <Icon icon="Check" className="text-primary size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-14 font-medium text-white">Step 3: Verify Status</p>
                      <p className="text-12 mt-0.5 text-white/60">
                        Click the button below once Docker is running
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center"
                >
                  <div className="bg-warning/10 border-warning/20 inline-flex items-center gap-2 rounded-full border px-4 py-2">
                    <Container className="text-warning size-4" />
                    <span className="text-13 font-medium text-white">
                      Status: <span className="text-warning">Not Running</span>
                    </span>
                  </div>
                </motion.div>

                {/* Check Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center pt-4"
                >
                  <Button
                    onClick={handleRetry}
                    disabled={isChecking}
                    variant="primary"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isChecking ? (
                      <>
                        <Icon icon="LoaderCircle" className="mr-2 size-4 animate-spin" />
                        Checking Docker...
                      </>
                    ) : (
                      'Check Docker Status'
                    )}
                  </Button>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {retryError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-destructive/20 bg-destructive/10 rounded-xl border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-destructive mt-0.5 size-5" />
                        <p className="text-13 text-destructive font-medium">{retryError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Footer */}
              <DialogFooter className="mt-8 flex items-center justify-between sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-12 h-auto text-white/40 hover:text-white"
                  onClick={() =>
                    window.windowIPC.openExternalLink('https://docs.docker.com/desktop/')
                  }
                >
                  Need help?
                </Button>

                <Button variant="outline" onClick={handleQuit} className="text-12">
                  Exit Setup
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="py-8 text-center"
            >
              {/* Success celebration */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  delay: 0.2
                }}
                className="relative mx-auto mb-6 size-24"
              >
                {/* Background glow */}
                <div className="bg-positive/20 absolute inset-0 rounded-full blur-2xl" />

                {/* Success icon container */}
                <div className="bg-positive/20 relative flex size-full items-center justify-center rounded-full backdrop-blur-xl">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 10, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5
                    }}
                  >
                    <Icon icon="CircleCheck" className="text-positive size-12" />
                  </motion.div>
                </div>

                {/* Confetti-like dots */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="from-yellow to-green absolute size-2 rounded-full bg-gradient-to-r"
                    initial={{
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 60,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 60,
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.6 + i * 0.05,
                      ease: 'easeOut'
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-24 mb-2 font-semibold text-white">Docker is Running!</h3>
                <p className="text-14 text-white/60">Starting OptimAI Core Node...</p>
              </motion.div>

              {/* Loading spinner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Icon icon="LoaderCircle" className="mx-auto size-5 animate-spin text-white/40" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
