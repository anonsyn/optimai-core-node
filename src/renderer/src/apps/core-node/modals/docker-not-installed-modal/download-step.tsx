import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Monitor, Package } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DownloadStepProps {
  onComplete: () => void
}

export function DownloadStep({ onComplete }: DownloadStepProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    // Check if installer already exists
    window.dockerIPC.getInstallerPath().then((path) => {
      if (path) {
        setIsCompleted(true)
        setDownloadProgress(100)
      }
    })
  }, [])

  useEffect(() => {
    if (!isDownloading) return

    // Listen for download progress
    const unsubscribe = window.dockerIPC.onDownloadProgress((progress) => {
      setDownloadProgress(progress.percent)

      if (progress.status === 'completed') {
        setIsCompleted(true)
        setIsDownloading(false)
        // setTimeout(() => onComplete(), 1500)
      } else if (progress.status === 'error') {
        setDownloadError('Download failed. Please try again.')
        setIsDownloading(false)
      }
    })

    return unsubscribe
  }, [isDownloading, onComplete])

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    const result = await window.dockerIPC.downloadInstaller()

    if (!result) {
      setDownloadError('Failed to download Docker installer. Please try again.')
      setIsDownloading(false)
    }
  }

  const getPlatformInfo = () => {
    const platform = window.navigator.platform.toLowerCase()
    if (platform.includes('mac')) {
      return {
        name: 'macOS'
      }
    }
    if (platform.includes('win')) {
      return {
        name: 'Windows'
      }
    }
    return {
      name: 'Linux'
    }
  }

  const platformInfo = getPlatformInfo()

  return (
    <div className="space-y-6">
      {/* Platform Detection Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center"
      >
        <div className="bg-primary/10 border-primary/20 inline-flex items-center gap-2 rounded-full border px-4 py-2">
          <Monitor className="text-primary size-4" />
          <span className="text-13 font-medium text-white">
            System: <span className="text-primary">{platformInfo.name}</span>
          </span>
        </div>
      </motion.div>

      {/* Download Action Area */}
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="download-action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            {!isDownloading ? (
              <>
                <Button
                  onClick={handleDownload}
                  variant="primary"
                  size="lg"
                  className="group relative mx-auto w-[400px] overflow-hidden"
                >
                  Start Download
                </Button>

                <div className="text-13 space-y-2 text-center text-white/50">
                  <div className="flex items-center justify-center gap-2">
                    <Package className="size-4 text-white/40" />
                    <span>Installer size: ~600MB</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="size-4 text-white/40" />
                    <span>Download time: 2-5 minutes on average</span>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full space-y-4"
              >
                {/* Download Progress */}
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-14 font-medium text-white">Downloading...</span>
                    <motion.span
                      key={downloadProgress}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-16 text-primary font-bold"
                    >
                      {downloadProgress}%
                    </motion.span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="bg-main absolute inset-y-0 left-0 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-y-0 rounded-full bg-white/20"
                      animate={{
                        x: [`-100%`, `${downloadProgress}%`],
                        opacity: [0.5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      style={{ width: '20%' }}
                    />
                  </div>

                  <p className="text-12 mt-2 text-center text-white/40">
                    Please wait while we prepare Docker Desktop for you
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="download-complete"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="border-positive/20 bg-positive/10 rounded-xl border p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-positive/20 flex size-12 items-center justify-center rounded-full">
                <Icon icon="CircleCheck" className="text-positive size-6" />
              </div>
              <div>
                <p className="text-16 font-semibold text-white">Download Complete!</p>
                <p className="text-13 text-white/60">Docker installer is ready for installation</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {downloadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-destructive/20 bg-destructive/10 rounded-xl border p-4"
          >
            <p className="text-13 text-destructive text-center font-medium">{downloadError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already Downloaded Notice */}
      {isCompleted && !isDownloading && (
        <motion.button
          onClick={onComplete}
          className="text-13 mx-auto block text-white/40 hover:text-white/60"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue to installation →
        </motion.button>
      )}
    </div>
  )
}
