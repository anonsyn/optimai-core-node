import Token from '@/components/branding/token'
import { formatNumber } from '@/utils/number'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { formatDistanceToNow } from 'date-fns'
import lodash from 'lodash'
import { ExternalLink } from 'lucide-react'

interface AssignmentItemProps {
  assignment: MiningAssignment
}

export const AssignmentItem = ({ assignment }: AssignmentItemProps) => {
  const id = lodash.get(assignment, 'id', '')
  const status = lodash.get(assignment, 'status', '')
  const sourceUrl = lodash.get(assignment, 'task.source_url', '')
  const reward = lodash.get(assignment, 'task.reward_amount', 0)
  const updatedAt = lodash.get(assignment, 'updated_at', lodash.get(assignment, 'started_at', ''))

  // Metadata from assignment level (when completed)
  const metadataTitle = lodash.get(assignment, 'metadata.title', '')
  const metadataDescription = lodash.get(assignment, 'metadata.description', '') || lodash.get(assignment, 'task.metadata.snippet', '')
  const favicon = lodash.get(assignment, 'metadata.favicon', '')
  const previewImage = lodash.get(assignment, 'metadata.og:image', '') || lodash.get(assignment, 'metadata.preview_image', '')

  const getStatusStyles = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { color: 'text-green/80', bgColor: 'bg-green/10', label: 'Completed' }
      case 'in_progress':
        return { color: 'text-yellow/80', bgColor: 'bg-yellow/10', label: 'Processing' }
      case 'failed':
        return { color: 'text-red-500/80', bgColor: 'bg-red-500/10', label: 'Failed' }
      default:
        return { color: 'text-white/40', bgColor: 'bg-white/5', label: 'Pending' }
    }
  }

  const formatTaskId = (id: string, full = false) => {
    if (full) return id
    return id.slice(0, 6) + '...' + id.slice(-4)
  }

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const statusStyles = getStatusStyles()
  const isCompleted = status.toLowerCase() === 'completed'
  const isProcessing = status.toLowerCase() === 'in_progress'

  // Render simple version for non-completed tasks
  if (!isCompleted) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.03]",
        isProcessing ? "bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] bg-[length:200%_100%] animate-shine" : "bg-white/[0.02]"
      )}>
        {/* Status Indicator */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full w-0.5',
            status.toLowerCase() === 'completed' && 'bg-green',
            status.toLowerCase() === 'in_progress' && 'bg-yellow animate-pulse',
            status.toLowerCase() === 'failed' && 'bg-red-500',
            !status && 'bg-white/10'
          )}
        />

        {/* Simple layout for non-completed */}
        <div className="p-4">
          {/* Header: ID and Time */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-11 font-mono text-white/50">{formatTaskId(id)}</span>
            <span className="text-11 text-white/30">
              {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Just now'}
            </span>
          </div>

          {/* Main: URL */}
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="size-3.5 text-white/40" />
            <span className="text-13 text-white/60 truncate" title={sourceUrl}>
              {sourceUrl ? getHostname(sourceUrl) : 'Processing...'}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            <div
              className={cn(
                'text-11 rounded px-2 py-0.5 font-medium inline-block',
                statusStyles.bgColor,
                statusStyles.color
              )}
            >
              {statusStyles.label}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full layout for completed tasks - Clean two-column design
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.03]">
      {/* Status Indicator */}
      <div className="absolute top-0 left-0 h-full w-0.5 bg-green" />

      <div className="p-4">
        {/* Header: Full ID and Time */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-11 font-mono text-white/60 break-all">{formatTaskId(id, true)}</span>
          <span className="text-11 text-white/50 ml-2 flex-shrink-0">
            {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Just now'}
          </span>
        </div>

        {/* Main Content - Two column layout */}
        <div className="flex gap-3 mb-3">
          {/* Preview Image Column - 16:9 aspect ratio */}
          {previewImage && (
            <div className="flex-shrink-0">
              <div className="w-56 h-[126px] rounded-lg overflow-hidden bg-white/5">
                <img
                  src={previewImage}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            </div>
          )}

          {/* Info Column */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Website with favicon */}
            <div className="flex items-center gap-2">
              {favicon ? (
                <img
                  src={favicon}
                  alt=""
                  className="size-4 rounded flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <ExternalLink className="size-4 text-white/40 flex-shrink-0" />
              )}
              <span className="text-12 text-white/70 truncate">
                {sourceUrl ? getHostname(sourceUrl) : 'Unknown'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-14 font-medium text-white/90 line-clamp-1">
              {metadataTitle || 'Untitled Page'}
            </h3>

            {/* Description */}
            {metadataDescription && (
              <p className="text-12 text-white/60 line-clamp-2">
                {metadataDescription}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Reward text */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-12 text-white/70">Rewarded</span>
            <span className="text-13 font-semibold text-white">
              {formatNumber(reward, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <Token className="size-3.5" />
          </div>
          <div
            className={cn(
              'text-11 rounded px-2 py-0.5 font-medium',
              statusStyles.bgColor,
              statusStyles.color
            )}
          >
            {statusStyles.label}
          </div>
        </div>
      </div>
    </div>
  )
}
