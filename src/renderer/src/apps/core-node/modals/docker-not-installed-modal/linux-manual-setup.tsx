import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LinuxManualSetupProps {
  onComplete: () => void
}

export function LinuxManualSetup({ onComplete }: LinuxManualSetupProps) {
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!isChecking) return

    let cancelled = false
    let interval: NodeJS.Timeout | null = null

    const pollDocker = async () => {
      if (cancelled) return

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
        }
      } catch (error) {
        console.error('Docker installation verification failed:', error)
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
        <div className="bg-positive/10 mx-auto mb-6 flex size-18 items-center justify-center rounded-full">
          <ExternalLink className="text-green size-7" />
        </div>
        <h3 className="text-20 font-semibold text-white">Install Docker on Linux</h3>
        <p className="text-16 mt-2 text-balance text-white/50">
          Docker installation on Linux varies by distribution. Follow the official guide to install
          Docker Desktop, then we&rsquo;ll continue automatically.
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
