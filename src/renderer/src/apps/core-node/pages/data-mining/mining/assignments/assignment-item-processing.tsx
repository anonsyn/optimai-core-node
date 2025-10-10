import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { format } from 'date-fns'
import lodash from 'lodash'
import { Activity, AlertTriangle, Clock3, Globe } from 'lucide-react'

interface AssignmentItemProcessingProps {
  assignment: MiningAssignment
}

export const AssignmentItemProcessing = ({ assignment }: AssignmentItemProcessingProps) => {
  const status = lodash.get(assignment, 'status', '')
  const sourceUrl = lodash.get(assignment, 'task.source_url', '')
  const updatedAt = lodash.get(assignment, 'updated_at', lodash.get(assignment, 'started_at', ''))

  const isProcessing = status.toLowerCase() === 'in_progress'
  const isFailed = status.toLowerCase() === 'failed'
  const isPending = status.toLowerCase() === 'not_started' || !status

  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return { label: 'Processing' }
      case 'failed':
        return { label: 'Failed' }
      default:
        return { label: 'Pending' }
    }
  }

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const statusStyles = getStatusStyles()

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.03]',
        isProcessing || isPending
          ? 'animate-shine bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] bg-[length:200%_100%]'
          : 'bg-white/[0.02]'
      )}
    >
      {/* Status Indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-0.5',
          isProcessing && 'bg-yellow animate-pulse',
          isFailed && 'bg-red-500',
          isPending && 'bg-white/20'
        )}
      />

      <div className="p-4">
        {/* Two column layout */}
        <div className="flex gap-3">
          {/* Left: Status Visual Area */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                'flex h-[126px] w-56 items-center justify-center overflow-hidden rounded-lg bg-white/5',
                isProcessing && 'relative'
              )}
            >
              {isProcessing ? (
                <Activity className="size-10 text-white/40" />
              ) : isFailed ? (
                <AlertTriangle className="size-10 text-white/40" />
              ) : (
                <Clock3 className="size-10 text-white/40" />
              )}
            </div>
          </div>

          {/* Right: Simplified Information */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Top section with status badge in same position as reward */}
            <div className="relative mb-2 flex w-full items-start justify-between">
              {/* Website with globe icon */}
              <div className="flex items-center gap-2">
                <div className="bg-accent/50 flex size-4 shrink-0 items-center justify-center rounded-full">
                  <Globe className="size-3 flex-shrink-0 text-white/60" />
                </div>
                <span className="text-11 truncate text-white/80">
                  {sourceUrl ? getHostname(sourceUrl) : 'Unknown'}
                </span>
              </div>

              {/* Status badge - same position as reward in completed */}
              <div
                className={cn(
                  'text-12 absolute top-1/2 right-0 flex -translate-y-1/2 items-center rounded-full border px-2.5 py-0.5',
                  isProcessing && 'border-yellow/20 bg-yellow/10 text-yellow',
                  isFailed && 'border-red-500/20 bg-red-500/10 text-red-500',
                  isPending && 'border-white/10 bg-white/5 text-white/60'
                )}
              >
                <span className="font-semibold">{statusStyles.label}</span>
              </div>
            </div>

            {/* URL */}
            <h3 className="text-14 mb-1 line-clamp-2 font-medium text-white">
              {sourceUrl || 'Preparing...'}
            </h3>

            {/* Processing state working text */}
            {isProcessing && (
              <p className="text-12 animate-shine via-yellow text-yellow/40 w-fit bg-gradient-to-r from-transparent to-transparent bg-[length:200%_100%] bg-clip-text !duration-[5s]">
                Mining data from webpage...
              </p>
            )}

            {/* Placeholder for description area to maintain consistent height */}
            {!isProcessing && <div className="flex-1" />}

            {/* Bottom metadata - same as completed */}
            <div className="mt-auto flex items-center gap-2 pt-2">
              <span className="text-12 text-white/60">
                {updatedAt ? format(new Date(updatedAt), 'MMM d, yyyy h:mm a') : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
