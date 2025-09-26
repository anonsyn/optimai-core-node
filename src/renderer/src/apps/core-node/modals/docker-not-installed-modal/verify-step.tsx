import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AnimatePresence, motion } from 'framer-motion'
import { Container, Search as SearchIcon, X, Zap } from 'lucide-react'
import { useState } from 'react'

interface VerifyStepProps {
  onSuccess: () => void
  onRetry: () => void
}

export function VerifyStep({ onSuccess, onRetry }: VerifyStepProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCheckDocker = async () => {
    setIsChecking(true)
    setCheckResult(null)
    setErrorMessage(null)

    try {
      // Check if Docker is installed
      const isInstalled = await window.dockerIPC.checkInstalled()

      if (!isInstalled) {
        setCheckResult('error')
        setErrorMessage('not-installed')
        setIsChecking(false)
        return
      }

      // Check if Docker is running
      const isRunning = await window.dockerIPC.checkRunning()

      if (!isRunning) {
        setCheckResult('error')
        setErrorMessage('not-running')
        setIsChecking(false)
        return
      }

      // Success!
      setCheckResult('success')
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch {
      setCheckResult('error')
      setErrorMessage('check-failed')
    } finally {
      setIsChecking(false)
    }
  }

  const getErrorContent = () => {
    switch (errorMessage) {
      case 'not-installed':
        return {
          Icon: SearchIcon,
          title: 'Docker Not Found',
          message: 'Docker Desktop is not detected. Please complete the installation.',
          action: 'Go Back to Installation',
          onAction: onRetry
        }
      case 'not-running':
        return {
          Icon: Zap,
          title: 'Docker Not Running',
          message: 'Docker Desktop is installed but not running.',
          tips: [
            'Open Docker Desktop from your Applications or Start Menu',
            'Wait for the Docker icon to appear in your system tray',
            'The Docker icon should stop animating when ready'
          ]
        }
      default:
        return {
          Icon: X,
          title: 'Check Failed',
          message: 'Failed to verify Docker status. Please try again.'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Check Button */}
      <AnimatePresence mode="wait">
        {checkResult !== 'success' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Button
              onClick={handleCheckDocker}
              disabled={isChecking}
              variant="primary"
              size="lg"
              className="group relative w-full overflow-hidden"
            >
              {isChecking ? (
                <>
                  <Icon icon="LoaderCircle" className="size-5 animate-spin" />
                  <span>Checking Docker...</span>
                </>
              ) : (
                <span>Verify Installation</span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <AnimatePresence mode="wait">
        {checkResult === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="border-positive/20 bg-positive/10 rounded-xl border p-6"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="bg-positive/20 mb-4 flex size-16 items-center justify-center rounded-full"
              >
                <Icon icon="CircleCheck" className="text-positive size-8" />
              </motion.div>
              <h3 className="text-18 font-semibold text-white">Docker is Ready!</h3>
              <p className="text-13 mt-1 text-white/60">Everything is set up correctly</p>
            </div>
          </motion.div>
        )}

        {checkResult === 'error' && (
          <motion.div
            key="error"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            {/* Error Card */}
            <div className="border-destructive/20 bg-destructive/10 rounded-xl border p-6">
              <div className="flex items-start gap-4">
                <div className="bg-destructive/20 flex size-10 items-center justify-center rounded-lg">
                  {(() => {
                    const ErrorIcon = getErrorContent().Icon
                    return ErrorIcon ? <ErrorIcon className="text-destructive size-5" /> : null
                  })()}
                </div>
                <div className="flex-1">
                  <h4 className="text-16 font-semibold text-white">{getErrorContent().title}</h4>
                  <p className="text-13 mt-1 text-white/70">{getErrorContent().message}</p>
                </div>
              </div>
            </div>

            {/* Tips for not-running error */}
            {errorMessage === 'not-running' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl bg-white/5 p-4"
              >
                <p className="text-12 mb-2 font-medium text-white/80">How to start Docker:</p>
                <div className="space-y-2">
                  {getErrorContent().tips?.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 text-xs">•</span>
                      <span className="text-12 text-white/60">{tip}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Button */}
            {getErrorContent().onAction && (
              <Button onClick={getErrorContent().onAction} variant="outline" className="w-full">
                <Icon icon="RotateCcw" className="size-4" />
                {getErrorContent().action}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Section */}
      {!checkResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-white/5 p-4"
        >
          <div className="flex gap-3">
            <Container className="text-primary mt-0.5 size-5" />
            <div className="text-13 space-y-1.5 text-white/60">
              <p className="font-medium text-white/80">Before you verify:</p>
              <p>• Make sure Docker Desktop is running</p>
              <p>• Look for the Docker icon in your system tray</p>
              <p>• First startup might take 1-2 minutes</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Troubleshooting Collapsible */}
      {/* {checkResult === 'error' && (
        <motion.details
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-white/5 p-4"
        >
          <summary className="text-13 flex cursor-pointer items-center gap-2 font-medium text-white/80 hover:text-white">
            <Wrench className="size-4 text-white/60" />
            Troubleshooting Tips
          </summary>
          <div className="text-13 mt-3 space-y-1.5 text-white/50">
            <p>• Restart your computer after installation</p>
            <p>• Check if virtualization is enabled (Windows)</p>
            <p>• Ensure you have administrator privileges</p>
            <p>• Try reinstalling Docker Desktop if issues persist</p>
          </div>
        </motion.details>
      )} */}
    </div>
  )
}
