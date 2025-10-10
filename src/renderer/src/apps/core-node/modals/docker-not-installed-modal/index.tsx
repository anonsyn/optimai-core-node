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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { SetupStep } from './setup-step'

export function DockerNotInstalledModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_INSTALLED)
  const data = useModalData(Modals.DOCKER_NOT_INSTALLED)
  const [isSuccess, setIsSuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsSuccess(false)
    }
  }, [open])

  const handleComplete = () => {
    setIsSuccess(true)

    // Call the original onRetry callback with success
    setTimeout(() => {
      if (data?.onRetry) {
        data.onRetry()
      }
    }, 2000)
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className={cn('overflow-hidden sm:max-w-md', isSuccess && 'sm:max-w-sm')}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="installation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-full flex-col"
            >
              {/* Header */}
              <DialogHeader className="relative pb-4">
                <div className="from-yellow/20 to-green/20 absolute -top-2 -right-2 size-16 rounded-full bg-gradient-to-br blur-3xl" />
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <DialogTitle className="text-18 text-start">
                    Let&apos;s Set Up Docker Together
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    We&apos;ll download and help you install Docker Desktop
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              {/* Content Area - Fixed Height */}
              <div className="max-h-[320px] min-h-[300px] flex-1">
                <ScrollArea className="h-full">
                  <div className="px-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut'
                      }}
                      className="h-[300px]"
                    >
                      <SetupStep onComplete={handleComplete} />
                    </motion.div>
                  </div>
                </ScrollArea>
              </div>

              {/* Footer */}
              <DialogFooter className="px-2 pt-2">
                <Button
                  variant="ghost"
                  className="text-12 h-auto text-white/60 hover:text-white"
                  onClick={() =>
                    window.windowIPC.openExternalLink('https://docs.docker.com/desktop/')
                  }
                >
                  Need help?
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
                <h3 className="text-24 mb-2 font-semibold text-white">Perfect! Docker is Ready</h3>
                <p className="text-14 text-white/80">Starting OptimAI Core Node...</p>
              </motion.div>

              {/* Loading spinner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Icon icon="LoaderCircle" className="mx-auto size-5 animate-spin text-white/60" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
