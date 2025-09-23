import Logo from '@/components/branding/logo'
import { Icon } from '@/components/ui/icon'
import { DockerNotInstalledModal } from '@core-node/modals/docker-not-installed-modal'
import { DockerNotRunningModal } from '@core-node/modals/docker-not-running-modal'
import LoginModal from '@core-node/modals/login-modal'
import CanvasGlow from '@core-node/pages/start-up/canvas-glow'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import { StartupPhase, StartupProvider, useStartup } from './provider'
import Status from './status'

const highlightItems = [
  {
    icon: 'CPU' as const,
    title: 'Performance tuned',
    description: 'Launch flow dynamically balances CPU and memory resources.'
  },
  {
    icon: 'Globe' as const,
    title: 'Network trusted',
    description: 'Connectivity and security checks run before the node joins the swarm.'
  }
]

const StartUpShell = () => {
  const { phase } = useStartup()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="bg-background text-foreground relative size-full overflow-hidden px-8 py-14 sm:px-12 md:px-16 xl:px-20"
    >
      <div className="drag-region absolute inset-x-0 top-0 h-24" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CanvasGlow className="opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(94,237,135,0.14),_transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,231,92,0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.05)_0%,rgba(9,28,21,0.16)_45%,transparent_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(0deg, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '120px 120px'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center gap-12">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex w-full flex-col items-center gap-6 text-center"
        >
          <Logo variant="horizontal" className="h-14 w-auto" />
          <div className="space-y-4">
            <p className="text-xs tracking-[0.35em] text-white/60 uppercase">Live boot sequence</p>
            <h1 className="text-3xl leading-tight font-semibold text-white sm:text-4xl">
              Your OptimAI node is preparing the network
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              We orchestrate updates, verify Docker, secure your credentials, and start the node
              automatically. Relax while we synchronise every service required to go online.
            </p>
          </div>
          <motion.ul
            className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            {highlightItems.map((item) => (
              <motion.li
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur transition"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon icon={item.icon} className="size-5 text-white" />
                </span>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs leading-relaxed text-white/60">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="startup-panel w-full"
        >
          <Status className="w-full" />
        </motion.section>

        <motion.footer
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="text-center text-xs text-white/50"
        >
          {phase === StartupPhase.COMPLETED
            ? 'All systems validated. You will be redirected to the dashboard in a moment.'
            : 'Need a moment to adjust settings? You can close the window and resume later — your progress is saved.'}
        </motion.footer>
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
