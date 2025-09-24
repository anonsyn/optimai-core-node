import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ErrorOverlayProps {
  error: string
}

export const ErrorOverlay = ({ error }: ErrorOverlayProps) => {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await window.nodeIPC.startNode()
    } catch (error) {
      console.error('Failed to restart mining:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-4 w-full max-w-md"
      >
        <div className="bg-background relative overflow-hidden rounded-xl border border-white/5 p-6">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <Icon icon="X" className="size-8 text-red-500/80" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-18 font-medium text-white">Mining Error</h3>
            <p className="text-13 mt-2 text-white/60">
              {error === 'Docker not available'
                ? 'Docker is not running. Please start Docker to enable mining.'
                : error === 'Crawler initialization failed'
                  ? 'Failed to initialize mining services. Please check Docker.'
                  : error || 'An unexpected error occurred.'}
            </p>

            {/* Docker help */}
            {error === 'Docker not available' && (
              <p className="text-12 mt-3 text-white/40">
                Download from{' '}
                <a
                  href="https://docker.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow hover:text-yellow/80 underline"
                >
                  docker.com
                </a>
              </p>
            )}
          </div>

          {/* Action */}
          <div className="mt-6">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
              variant="primary"
            >
              {isRetrying ? (
                <>
                  <Icon icon="LoaderCircle" className="size-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Icon icon="RotateCcw" className="size-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
