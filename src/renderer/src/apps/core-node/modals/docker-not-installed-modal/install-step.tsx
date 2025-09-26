import { Button, SecondaryText } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  FileCode,
  Folder,
  Package,
  RefreshCw,
  Rocket,
  Settings,
  Sparkles,
  Target,
  Terminal,
  Zap
} from 'lucide-react'
import { useState } from 'react'

interface InstallStepProps {
  onComplete: () => void
}

export function InstallStep({ onComplete }: InstallStepProps) {
  const [hasOpenedInstaller, setHasOpenedInstaller] = useState(false)
  const [openError, setOpenError] = useState<string | null>(null)

  const handleOpenInstaller = async () => {
    setOpenError(null)

    const success = await window.dockerIPC.openInstaller()

    if (success) {
      setHasOpenedInstaller(true)
    } else {
      setOpenError('Failed to open installer. Please open it manually from your Downloads folder.')
    }
  }

  const getPlatformSteps = () => {
    const platform = window.navigator.platform.toLowerCase()

    if (platform.includes('mac')) {
      return [
        { Icon: FileCode, text: 'Double-click Docker.dmg to mount it' },
        { Icon: Target, text: 'Drag Docker to Applications folder' },
        { Icon: Rocket, text: 'Open Docker from Applications' },
        { Icon: Sparkles, text: 'Complete the setup wizard' }
      ]
    }

    if (platform.includes('win')) {
      return [
        { Icon: Package, text: 'Run Docker Desktop Installer' },
        { Icon: Settings, text: 'Follow installation wizard' },
        { Icon: Settings, text: 'Keep default settings' },
        { Icon: RefreshCw, text: 'Restart when prompted' }
      ]
    }

    return [
      { Icon: Terminal, text: 'Open terminal window' },
      { Icon: Folder, text: 'Navigate to Downloads' },
      { Icon: Zap, text: 'Run installation script' },
      { Icon: CheckCircle, text: 'Follow the prompts' }
    ]
  }

  const steps = getPlatformSteps()

  return (
    <div className="space-y-4">
      {/* Action Button */}
      <AnimatePresence mode="wait">
        {!hasOpenedInstaller ? (
          <motion.div
            key="open-button"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Button
              onClick={handleOpenInstaller}
              variant="primary"
              className="group relative w-full overflow-hidden"
            >
              Open Installer
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="opened-status"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="border-primary/20 bg-primary/10 rounded-xl border p-4"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-primary/20 flex size-10 items-center justify-center rounded-full"
              >
                <Icon icon="CircleCheck" className="text-primary size-5" />
              </motion.div>
              <div>
                <p className="text-14 font-semibold text-white">Installer Opened!</p>
                <p className="text-12 text-white/60">Follow the steps below</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue Button */}
      {hasOpenedInstaller && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Button onClick={onComplete} variant="secondary" className="w-full">
            <SecondaryText>I&apos;ve Completed Installation</SecondaryText>
          </Button>
        </motion.div>
      )}

      {/* Installation Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h4 className="text-14 font-medium text-white/80">Installation Steps:</h4>

        <div className="space-y-2 pr-2">
          {steps.map((step, index) => {
            const StepIcon = step.Icon
            return (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20">
                  <StepIcon className="text-primary size-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-12 text-primary/60 font-medium">Step {index + 1}</span>
                  <span className="text-13 text-white/80">{step.text}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Important Tips */}
      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-warning/20 bg-warning/10 rounded-xl border p-4"
      >
        <div className="flex gap-3">
          <Info className="text-warning mt-0.5 size-5" />
          <div className="text-12 space-y-1.5 text-white/70">
            <p className="font-medium text-white/90">Quick Tips:</p>
            <p>• Installation takes about 5-10 minutes</p>
            <p>• You may need to enter your password</p>
            <p>• Docker will auto-start after installation</p>
          </div>
        </div>
      </motion.div> */}

      {/* Error Message */}
      <AnimatePresence>
        {openError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-destructive/20 bg-destructive/10 rounded-xl border p-4"
          >
            <p className="text-13 text-destructive text-center">{openError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
