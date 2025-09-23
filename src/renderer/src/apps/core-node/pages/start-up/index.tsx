import Logo from '@/components/branding/logo'
import { DockerNotInstalledModal } from '@core-node/modals/docker-not-installed-modal'
import { DockerNotRunningModal } from '@core-node/modals/docker-not-running-modal'
import LoginModal from '@core-node/modals/login-modal'
import CanvasGlow from '@core-node/pages/start-up/canvas-glow'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { StartupProvider, useStartup } from './provider'
import Status from './status'

const StartUpShell = () => {
  const { phase } = useStartup()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative flex size-full flex-col overflow-hidden bg-background text-foreground"
    >
      <div className="drag-region absolute inset-x-0 top-0 z-50 h-20" />

      {/* Background Layer - Subtle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CanvasGlow className="opacity-30" phase={phase} />

        {/* Very subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80" />

        {/* Subtle grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Main Content - Centered */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        {/* Logo - Small and subtle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute top-8"
        >
          <Logo variant="horizontal" className="h-8 w-auto opacity-50" />
        </motion.div>

        {/* Status - Main Focus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="flex flex-col items-center gap-8"
        >
          <Status />
        </motion.div>

      </div>

      <LoginModal />
      <DockerNotInstalledModal />
      <DockerNotRunningModal />
    </div>
  )
}

const StartUpPage = () => {
  return (
    <StartupProvider>
      <StartUpShell />
    </StartupProvider>
  )
}

export default StartUpPage