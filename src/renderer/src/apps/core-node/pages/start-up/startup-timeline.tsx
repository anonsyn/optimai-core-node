import Spinner from '@/components/ui/spinner'
import { cn } from '@/utils/tw'
import { CheckCircle2, Circle, AlertCircle, Download } from 'lucide-react'
import { ReactNode } from 'react'

export type StepStatus = 'pending' | 'checking' | 'downloading' | 'success' | 'error' | 'warning'

export interface TimelineStep {
  id: string
  title: string
  description?: string
  status: StepStatus
  progress?: number // For download progress
  detail?: string // Error or warning message
  action?: ReactNode // Custom action component (like download button)
}

interface StartupTimelineProps {
  steps: TimelineStep[]
  className?: string
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-white/30',
    lineColor: 'bg-white/10'
  },
  checking: {
    icon: null, // Will show spinner
    color: 'text-primary',
    lineColor: 'bg-primary/30'
  },
  downloading: {
    icon: Download,
    color: 'text-primary',
    lineColor: 'bg-primary/30'
  },
  success: {
    icon: CheckCircle2,
    color: 'text-positive',
    lineColor: 'bg-positive/30'
  },
  error: {
    icon: AlertCircle,
    color: 'text-destructive',
    lineColor: 'bg-destructive/30'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    lineColor: 'bg-warning/30'
  }
} as const

export const StartupTimeline = ({ steps, className }: StartupTimelineProps) => {
  return (
    <div className={cn('flex flex-col gap-0', className)}>
      {steps.map((step, index) => {
        const config = statusConfig[step.status]
        const isLast = index === steps.length - 1
        const isActive = step.status === 'checking' || step.status === 'downloading'
        const isComplete = step.status === 'success'
        const hasIssue = step.status === 'error' || step.status === 'warning'

        return (
          <div key={step.id} className="relative flex">
            {/* Connection Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute left-5 top-12 h-[calc(100%-1rem)] w-0.5',
                  isComplete ? 'bg-positive/30' : 'bg-white/10'
                )}
              />
            )}

            {/* Step Content */}
            <div className="flex w-full gap-4 p-4">
              {/* Icon */}
              <div className={cn('relative z-10 flex-shrink-0', config.color)}>
                <div className="rounded-full bg-background p-1">
                  {step.status === 'checking' ? (
                    <Spinner className="h-6 w-6" />
                  ) : config.icon ? (
                    <config.icon className="h-6 w-6" />
                  ) : null}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'text-16 font-semibold leading-normal',
                        isActive || isComplete || hasIssue ? 'text-white' : 'text-white/50'
                      )}
                    >
                      {step.title}
                    </h3>

                    {step.description && (
                      <p
                        className={cn(
                          'mt-1 text-14 leading-normal',
                          isActive || isComplete || hasIssue ? 'text-white/70' : 'text-white/30'
                        )}
                      >
                        {step.description}
                      </p>
                    )}

                    {/* Progress Bar for Downloads */}
                    {step.status === 'downloading' && step.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-12 text-white/50 mb-1">
                          <span>Downloading...</span>
                          <span>{Math.round(step.progress)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow to-green transition-all duration-300"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Detail/Error Message */}
                    {step.detail && (
                      <div
                        className={cn(
                          'mt-3 rounded-lg border p-3',
                          hasIssue
                            ? 'bg-destructive/10 border-destructive/30'
                            : 'bg-black/20 border-white/10'
                        )}
                      >
                        <p className="text-12 font-mono text-white/60">{step.detail}</p>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {step.action && (
                    <div className="flex-shrink-0">
                      {step.action}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}