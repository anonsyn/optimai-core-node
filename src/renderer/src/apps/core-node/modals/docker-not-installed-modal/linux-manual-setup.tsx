import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LinuxManualSetupProps {
  onComplete: () => void
}

export function LinuxManualSetup({ onComplete }: LinuxManualSetupProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  useEffect(() => {
    if (!isChecking) return

    let cancelled = false
    let interval: NodeJS.Timeout | null = null
    let currentAttempt = 0

    const pollDocker = async () => {
      if (cancelled) return

      currentAttempt++
      setAttempts(currentAttempt)

      try {
        const isInstalled = await window.dockerIPC.checkInstalled()

        if (cancelled) {
          return
        }

        if (isInstalled) {
          onComplete?.()
          if (interval) {
            clearInterval(interval)
            interval = null
          }
          return
        }

        // Stop after max attempts
        if (currentAttempt >= maxAttempts) {
          setIsChecking(false)
          if (interval) {
            clearInterval(interval)
            interval = null
          }
        }
      } catch (error) {
        console.error('Docker installation verification failed:', error)
        if (currentAttempt >= maxAttempts) {
          setIsChecking(false)
          if (interval) {
            clearInterval(interval)
            interval = null
          }
        }
      }
    }

    pollDocker()
    interval = setInterval(pollDocker, 5000)

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [isChecking, onComplete])

  const handleCheckInstallation = () => {
    setIsChecking(true)
    setAttempts(0)
  }

  return (
    <div className="flex h-full flex-col">
      <motion.div
        key="instructions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="mx-auto mb-6 flex size-18 items-center justify-center rounded-full bg-white/10">
          <Icon icon="Docker" className="size-8 text-white/80" />
        </div>
        <h3 className="text-20 font-semibold text-white">Install Docker on Linux</h3>
        <p className="text-16 mt-2 text-balance text-white/50">
          {attempts >= maxAttempts && !isChecking
            ? 'Docker not found. Make sure Docker is installed and running, then try again.'
            : 'Docker installation on Linux varies by distribution. Follow the official guide to install Docker Desktop.'}
        </p>
      </motion.div>

      <div className="space-y-2 pt-6">
        <Button
          onClick={handleCheckInstallation}
          disabled={isChecking}
          className="from-yellow to-green w-full bg-gradient-to-r text-black hover:opacity-90 disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Icon icon="LoaderCircle" className="size-4 animate-spin" />
              Checking Docker installation...
            </>
          ) : (
            "I've Installed Docker"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            window.windowIPC.openExternalLink(
              'https://docs.docker.com/desktop/setup/install/linux/ubuntu/'
            )
          }
        >
          Get help
        </Button>
      </div>
    </div>
  )
}
