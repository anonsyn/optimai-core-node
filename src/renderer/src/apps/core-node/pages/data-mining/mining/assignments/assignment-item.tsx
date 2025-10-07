import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { formatNumber } from '@/utils/number'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { formatDistanceToNow } from 'date-fns'
import lodash from 'lodash'
import { ExternalLink, Globe } from 'lucide-react'

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
  const metadataDescription =
    lodash.get(assignment, 'metadata.description', '') ||
    lodash.get(assignment, 'task.metadata.snippet', '')
  const favicon = lodash.get(assignment, 'metadata.favicon', '')
  const previewImage =
    lodash.get(assignment, 'metadata.og:image', '') ||
    lodash.get(assignment, 'metadata.preview_image', '')

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
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.03]',
          isProcessing
            ? 'animate-shine bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] bg-[length:200%_100%]'
            : 'bg-white/[0.02]'
        )}
      >
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
          <div className="mb-3 flex items-center justify-between">
            <span className="text-11 font-mono text-white/50">{formatTaskId(id)}</span>
            <span className="text-11 text-white/30">
              {updatedAt
                ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
                : 'Just now'}
            </span>
          </div>

          {/* Main: URL */}
          <div className="mb-3 flex items-center gap-2">
            <ExternalLink className="size-3.5 text-white/40" />
            <span className="text-13 truncate text-white/60" title={sourceUrl}>
              {sourceUrl ? getHostname(sourceUrl) : 'Processing...'}
            </span>
          </div>

          {/* Status */}
          <div className="flex justify-end">
            <div
              className={cn(
                'text-11 inline-block rounded px-2 py-0.5 font-medium',
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

  // Full layout for completed tasks - Cleaner design
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.03]">
      {/* Status Indicator */}
      <div className="bg-green absolute top-0 left-0 h-full w-0.5" />

      <div className="p-4">
        {/* Main Content - Two column layout */}
        <div className="flex gap-3">
          {/* Preview Image Column - 16:9 aspect ratio */}
          <div className="flex-shrink-0">
            <div
              className="flex h-[126px] w-56 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-white/5 transition-opacity hover:opacity-80"
              onClick={() => {
                if (sourceUrl) {
                  window.windowIPC.openExternalLink(sourceUrl)
                }
              }}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <Icon className="text-white/60" icon="ArticleLine" />
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Top section with domain and reward */}
            <div className="relative mb-2 flex w-full items-start justify-between">
              {/* Website with favicon */}
              <div
                className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-70"
                onClick={() => {
                  if (sourceUrl) {
                    window.windowIPC.openExternalLink(sourceUrl)
                  }
                }}
              >
                {favicon ? (
                  <img
                    src={favicon}
                    alt=""
                    className="size-4 flex-shrink-0 rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="bg-accent/50 flex size-4 shrink-0 items-center justify-center rounded-full">
                    <Globe className="size-3 flex-shrink-0 text-white/60" />
                  </div>
                )}
                <span className="text-11 truncate text-white/80">
                  {sourceUrl ? getHostname(sourceUrl) : 'Unknown'}
                </span>
              </div>

              {/* Reward badge */}
              <div className="bg-green/10 border-green/20 text-green text-12 absolute top-1/2 right-0 flex -translate-y-1/2 items-center gap-1.5 rounded-full border px-2.5 py-0.5">
                <span className="font-semibold">
                  +{formatNumber(reward, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <Token className="size-3" />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-14 mb-1 line-clamp-2 cursor-pointer font-medium text-white transition-colors hover:text-white/80"
              onClick={() => {
                // TODO: Implement title click action
                console.log('Title clicked:', { id, title: metadataTitle, sourceUrl })
              }}
            >
              {metadataTitle || 'Untitled Page'}
            </h3>

            {/* Description - increased to 3 lines */}
            {metadataDescription && (
              <p className="text-12 line-clamp-3 leading-relaxed text-white/80">
                {metadataDescription}
              </p>
            )}

            {/* Bottom metadata - subtle */}
            <div className="mt-auto flex items-center gap-2 pt-2">
              <span className="text-10 text-white/60">
                {updatedAt
                  ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true })
                  : 'Just now'}
              </span>
              <span className="text-10 text-white/60">•</span>
              <span className="text-10 font-mono text-white/60">{formatTaskId(id)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
