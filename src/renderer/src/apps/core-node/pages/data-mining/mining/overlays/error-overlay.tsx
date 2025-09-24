import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'

interface ErrorOverlayProps {
  error: string
}

export const ErrorOverlay = ({ error }: ErrorOverlayProps) => {
  const handleRetry = async () => {
    try {
      await window.nodeIPC.startNode()
    } catch (error) {
      console.error('Failed to restart mining:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-4 w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-background/95 backdrop-blur-md"
      >
        <div className="p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <Icon icon="X" className="size-8 text-destructive" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-20 font-semibold text-white">Mining Error</h3>
            <p className="text-14 mt-3 text-white/60">
              {error === 'Docker not available'
                ? 'Docker is not running. Please install and start Docker to enable mining.'
                : error === 'Crawler initialization failed'
                ? 'Failed to initialize the crawler service. Please check Docker is running properly.'
                : error || 'An unexpected error occurred while mining.'}
            </p>

            {/* Docker specific help */}
            {error === 'Docker not available' && (
              <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <p className="text-12 text-white/40">
                  Visit{' '}
                  <a
                    href="https://docker.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main hover:underline"
                  >
                    docker.com
                  </a>{' '}
                  to download Docker Desktop
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={handleRetry}
              className="bg-main flex-1 text-black transition-all hover:bg-main/90"
            >
              <Icon icon="RotateCcw" className="mr-2 size-4" />
              Try Again
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}