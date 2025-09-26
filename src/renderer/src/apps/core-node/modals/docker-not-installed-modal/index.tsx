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
import { DownloadStep } from './download-step'
import { InstallStep } from './install-step'
import { ProgressIndicator } from './progress-indicator'
import { VerifyStep } from './verify-step'

type InstallationStep = 'download' | 'install' | 'verify'

const STEPS = [
  { id: 'download', label: 'Download' },
  { id: 'install', label: 'Install' },
  { id: 'verify', label: 'Verify' }
]

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
}

export function DockerNotInstalledModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_INSTALLED)
  const data = useModalData(Modals.DOCKER_NOT_INSTALLED)
  const [currentStep, setCurrentStep] = useState<InstallationStep>('download')
  const [direction, setDirection] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep) + 1

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setCurrentStep('download')
      setIsSuccess(false)
      setDirection(0)
    }
  }, [open])

  const handleStepComplete = (step: InstallationStep) => {
    setDirection(1)

    // Advance to next step
    if (step === 'download') {
      setTimeout(() => setCurrentStep('install'), 300)
    } else if (step === 'install') {
      setTimeout(() => setCurrentStep('verify'), 300)
    }
  }

  const handleVerifySuccess = () => {
    setIsSuccess(true)

    // Call the original onRetry callback with success
    setTimeout(() => {
      if (data?.onRetry) {
        data.onRetry()
      }
    }, 2000)
  }

  const handleRetryInstall = () => {
    setDirection(-1)
    setTimeout(() => setCurrentStep('install'), 100)
  }

  const handleQuit = () => {
    window.windowIPC.close()
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'download':
        return 'Download Docker Desktop'
      case 'install':
        return 'Install Docker Desktop'
      case 'verify':
        return 'Verify Installation'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'download':
        return "We'll download the right version for your computer"
      case 'install':
        return 'Run the installer and follow the simple steps'
      case 'verify':
        return "Let's make sure everything is working correctly"
      default:
        return ''
    }
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
              key="installation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with friendly greeting */}
              <DialogHeader className="relative">
                <div className="from-primary/20 to-positive/20 absolute -top-2 -right-2 size-20 rounded-full bg-gradient-to-br blur-3xl" />
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <DialogTitle className="text-20 text-start">
                    Let&apos;s Set Up Docker Together
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    Docker Desktop powers the OptimAI Core Node. Don&apos;t worry, we&apos;ll guide
                    you through everything!
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              {/* Progress Indicator */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 px-4"
              >
                <ProgressIndicator steps={STEPS} currentStep={currentStepIndex} className="mb-8" />
              </motion.div>

              {/* Step Content Area */}
              <ScrollArea className="relative -mx-4 h-[320px] overflow-x-hidden">
                {/* Step Header */}
                <div className="px-4">
                  <motion.div
                    key={currentStep + '-header'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 text-center"
                  >
                    <h3 className="text-18 font-semibold text-white">{getStepTitle()}</h3>
                    <p className="text-14 mt-1 text-white/60">{getStepDescription()}</p>
                  </motion.div>

                  {/* Step Component */}
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      className="px-2"
                    >
                      {currentStep === 'download' && (
                        <DownloadStep onComplete={() => handleStepComplete('download')} />
                      )}
                      {currentStep === 'install' && (
                        <InstallStep onComplete={() => handleStepComplete('install')} />
                      )}
                      {currentStep === 'verify' && (
                        <VerifyStep onSuccess={handleVerifySuccess} onRetry={handleRetryInstall} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </ScrollArea>

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
                <h3 className="text-24 mb-2 font-semibold text-white">Perfect! Docker is Ready</h3>
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
