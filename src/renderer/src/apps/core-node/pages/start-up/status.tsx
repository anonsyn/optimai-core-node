import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { motion } from 'framer-motion'
import { HTMLAttributes, useEffect, useMemo, useRef } from 'react'
import { StartupPhase, useStartup } from './provider'
import WaveVisualizer from './wave-visualizer'

interface StatusProps extends HTMLAttributes<HTMLDivElement> {}

type Step = {
  phase: StartupPhase
  title: string
  description: string
  icon: 'CPU' | 'LoaderCircle' | 'Globe' | 'Hourglass' | 'CircleCheck' | 'LockOpen'
}

const steps: Step[] = [
  {
    phase: StartupPhase.INITIALIZING,
    title: 'Launcher warm-up',
    description: 'Preparing local environment and services.',
    icon: 'CPU'
  },
  {
    phase: StartupPhase.CHECKING_UPDATES,
    title: 'Checking updates',
    description: 'Ensuring your app is on the latest release.',
    icon: 'Globe'
  },
  {
    phase: StartupPhase.CHECKING_DOCKER,
    title: 'Docker validation',
    description: 'Confirming installation and daemon health.',
    icon: 'LoaderCircle'
  },
  {
    phase: StartupPhase.INITIALIZING_CRAWLER,
    title: 'Crawler image',
    description: 'Pulling and launching the Crawl4AI container.',
    icon: 'Hourglass'
  },
  {
    phase: StartupPhase.CHECKING_AUTH,
    title: 'Authenticating session',
    description: 'Refreshing secure access tokens.',
    icon: 'LockOpen'
  },
  {
    phase: StartupPhase.STARTING_NODE,
    title: 'Booting node',
    description: 'Starting OptimAI core node services.',
    icon: 'LoaderCircle'
  },
  {
    phase: StartupPhase.COMPLETED,
    title: 'Ready to explore',
    description: 'All systems go — launching dashboard shortly.',
    icon: 'CircleCheck'
  }
]

const circumference = 2 * Math.PI * 32

const Status = ({ className, ...props }: StatusProps) => {
  const { statuses, error, canRetry, retry, phase } = useStartup()
  const [historyRef] = useAutoAnimate()
  const lastHealthyPhaseRef = useRef<StartupPhase>(StartupPhase.INITIALIZING)

  useEffect(() => {
    if (phase !== StartupPhase.ERROR) {
      lastHealthyPhaseRef.current = phase
    }
  }, [phase])

  const displayPhase = phase === StartupPhase.ERROR ? lastHealthyPhaseRef.current : phase

  const activeIndex = useMemo(() => {
    const index = steps.findIndex((step) => step.phase === displayPhase)
    return index === -1 ? 0 : index
  }, [displayPhase])

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0
    return Math.min(1, Math.max(0, activeIndex / (steps.length - 1)))
  }, [activeIndex])

  const currentStep = steps[activeIndex]
  const nextStep = steps[Math.min(activeIndex + 1, steps.length - 1)]
  const latestEvents = useMemo(() => statuses.slice(-4).reverse(), [statuses])

  const telemetry = useMemo(() => {
    const dockerReady = statuses.some((status) =>
      status.message.toLowerCase().includes('docker requirements satisfied')
    )
    const crawlerReady = statuses.some((status) =>
      status.message.toLowerCase().includes('crawler service initialized successfully')
    )
    const nodeReady = statuses.some((status) =>
      status.message.toLowerCase().includes('node started successfully')
    )

    return [
      {
        label: 'Docker',
        value: dockerReady ? 'Ready' : 'Checking',
        ready: dockerReady
      },
      {
        label: 'Crawler',
        value: crawlerReady ? 'Initialized' : 'Preparing',
        ready: crawlerReady
      },
      {
        label: 'Core node',
        value: nodeReady ? 'Online' : 'Booting',
        ready: nodeReady
      }
    ]
  }, [statuses])

  const hasError = canRetry && Boolean(error)

  return (
    <div className={cn('flex h-full flex-col gap-6 text-white', className)} {...props}>
      <motion.section
        key={currentStep.phase}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,231,92,0.14),_transparent_60%)] opacity-75" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,rgba(4,63,57,0.2)_45%,transparent_100%)]" />

        <div className="relative flex flex-col gap-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.35em] text-white/60 uppercase">
                Current checkpoint
              </p>
              <p className="text-lg font-medium text-white">{currentStep.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs tracking-[0.25em] text-white/50 uppercase">
                Step {Math.min(activeIndex + 1, steps.length)} of {steps.length}
              </div>
              <motion.div
                key={progress}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-white/10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(94,237,135,0.25)_0%,transparent_70%)]" />
                <div className="relative flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                  {Math.round(progress * 100)}%
                </div>
              </motion.div>
            </div>
          </header>

          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="relative flex size-20 shrink-0 items-center justify-center">
                <motion.svg
                  key={currentStep.phase}
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  className="absolute inset-0"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: -90, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#5EED87"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: (1 - progress) * circumference }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </motion.svg>
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(94,237,135,0.24)_0%,_rgba(94,237,135,0.08)_65%,_transparent_100%)]" />
                <Icon
                  icon={currentStep.icon}
                  className={cn(
                    'relative size-6 text-white drop-shadow-[0_0_18px_rgba(94,237,135,0.4)]',
                    currentStep.icon === 'LoaderCircle' && 'animate-[spin_4s_linear_infinite]'
                  )}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{currentStep.title}</p>
                <p className="text-sm leading-relaxed text-white/70">{currentStep.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-[pulse_4s_ease-in-out_infinite] rounded-full bg-[#5EED87]" />
                Latest activity
              </div>
              <span className="text-white/70">
                {latestEvents[0]?.message ?? 'Initializing components'}
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/60">
              <div className="flex items-center gap-2 text-white/70">
                <Icon icon="ArrowRight" className="size-3.5 rotate-180 text-white/40" />
                Up next
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-white/5 px-3 py-2 text-white/70">
                <p className="text-sm font-semibold text-white">{nextStep.title}</p>
                <p>{nextStep.description}</p>
              </div>
            </div>

            <div className="relative mt-6 h-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <WaveVisualizer />
            </div>
          </div>

          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="bg-main absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
        className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#04150F]/80 p-6 text-white backdrop-blur"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(94,237,135,0.12),_transparent_55%)] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.06)_0%,rgba(4,63,57,0.18)_55%,transparent_100%)]" />

        <header className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.35em] text-white/60 uppercase">System history</p>
            <p className="text-lg font-medium text-white">Recent events</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">
            {statuses.length} total
          </span>
        </header>

        <div className="relative z-10 mt-5 grid gap-3 text-xs text-white/70 sm:grid-cols-3">
          {telemetry.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
              className={cn(
                'flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
                item.ready ? 'text-white' : 'text-white/60'
              )}
            >
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-white">{item.value}</span>
              </div>
              <Icon
                icon={item.ready ? 'CircleCheck' : 'LoaderCircle'}
                className={cn(
                  'size-4',
                  item.ready ? 'text-[#5EED87]' : 'animate-[spin_5s_linear_infinite] text-white/50'
                )}
              />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-4 h-[150px] overflow-hidden rounded-2xl border border-white/5 bg-white/5">
          <div
            ref={historyRef}
            className="h-full overflow-y-auto px-4 py-3"
            style={{
              maskImage:
                'linear-gradient(180deg, rgba(4, 21, 15, 0.00) 0%, rgba(4, 21, 15, 1) 20%, rgba(4, 21, 15, 1) 80%, rgba(4, 21, 15, 0.00) 100%)'
            }}
          >
            <ul className="flex flex-col gap-2 text-sm">
              {latestEvents.length > 0 ? (
                latestEvents.map((status, index) => (
                  <li
                    key={`${status.message}-${index}`}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border border-transparent bg-transparent px-3 py-2 text-white/70',
                      status.error && 'border-destructive/40 bg-destructive/10 text-destructive'
                    )}
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5EED87]" />
                    <p className="leading-relaxed">{status.message}</p>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/60">
                  Awaiting first event...
                </li>
              )}
            </ul>
          </div>
        </div>

        {hasError && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="border-destructive/30 bg-destructive/10 text-destructive relative z-10 mt-4 flex flex-col gap-3 rounded-2xl border px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon icon="Info" className="size-4" />
              Action required
            </div>
            <p className="text-sm leading-relaxed">{error}</p>
            <button
              onClick={retry}
              className="border-destructive/40 bg-destructive/20 text-destructive hover:bg-destructive/30 self-start rounded-full border px-4 py-1.5 text-xs font-medium transition"
            >
              Retry now
            </button>
          </motion.div>
        )}
      </motion.section>
    </div>
  )
}

export default Status
