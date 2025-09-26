import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'

interface ProgressIndicatorProps {
  steps: Array<{
    id: string
    label: string
  }>
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className }: ProgressIndicatorProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Step dots with pipeline connections */}
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep

          return (
            <div key={step.id} className="relative flex w-12 flex-col items-center">
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                  isCompleted && 'border-positive bg-positive/20',
                  !isCompleted && stepNumber === currentStep && 'border-white/20 bg-white/2',
                  !isCompleted && stepNumber !== currentStep && 'border-white/10 bg-white/5'
                )}
              >
                {isCompleted ? (
                  <Icon icon="Check" className="text-positive size-5" />
                ) : (
                  <span
                    className={cn(
                      'text-16 font-bold',
                      stepNumber === currentStep ? 'text-white' : 'text-white/60'
                    )}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-12 mt-3 text-center font-semibold whitespace-nowrap transition-all',
                  isCompleted && 'text-positive',
                  !isCompleted && stepNumber === currentStep && 'text-white',
                  !isCompleted && stepNumber !== currentStep && 'text-white/40'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Connection Lines, the gap and padding x need to equal to the circle size */}
      <div className="absolute inset-x-0 top-0 flex h-12 items-center gap-12 px-12">
        {steps.map((_, index) => {
          const stepNumber = index + 1
          const isLast = index === steps.length - 1
          const isCompleted = stepNumber < currentStep
          if (isLast) {
            return null
          }
          return (
            <div
              key={index}
              className={cn(
                'h-1 flex-1 border-y border-white/5 bg-transparent transition-all duration-300',
                isCompleted && 'border-white/10'
              )}
            ></div>
          )
        })}
      </div>
    </div>
  )
}
