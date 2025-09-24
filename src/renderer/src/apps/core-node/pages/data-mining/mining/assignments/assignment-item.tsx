import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { formatNumber } from '@/utils/number'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { formatDistanceToNow } from 'date-fns'
import lodash from 'lodash'

interface AssignmentItemProps {
  assignment: MiningAssignment
}

export const AssignmentItem = ({ assignment }: AssignmentItemProps) => {
  const id = lodash.get(assignment, 'id', '')
  const status = lodash.get(assignment, 'status', '')
  const title = lodash.get(assignment, 'task.metadata.title', '')
  const snippet = lodash.get(assignment, 'task.metadata.snippet', '')
  const platform = lodash.get(assignment, 'task.platform', '')
  const searchQuery = lodash.get(assignment, 'task.search_query', '')
  const sourceUrl = lodash.get(assignment, 'task.source_url', '')
  const reward = lodash.get(assignment, 'task.reward_amount', 0)
  const updatedAt = lodash.get(assignment, 'updated_at', lodash.get(assignment, 'started_at', ''))

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

  const formatTaskId = (id: string) => {
    return id.slice(0, 6) + '...' + id.slice(-4)
  }

  const statusStyles = getStatusStyles()

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all hover:bg-white/[0.03]">
      {/* Status Indicator */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-0.5',
          status.toLowerCase() === 'completed' && 'bg-green',
          status.toLowerCase() === 'in_progress' && 'bg-yellow animate-pulse',
          status.toLowerCase() === 'failed' && 'bg-red-500',
          !status && 'bg-white/10'
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-11 font-mono text-white/30">{formatTaskId(id)}</span>
          <span className="text-11 text-white/20">•</span>
          <span className="text-11 capitalize text-white/30">{platform || 'Web'}</span>
        </div>
        <div className={cn('rounded px-2 py-0.5 text-11 font-medium', statusStyles.bgColor, statusStyles.color)}>
          {statusStyles.label}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="text-15 font-medium text-white line-clamp-2">{title || 'Processing assignment...'}</h3>
        {snippet && (
          <p className="text-12 mt-2 line-clamp-2 text-white/40">{snippet}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
        <span className="text-11 text-white/30">
          {updatedAt ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true }) : 'Just now'}
        </span>
        <div className="flex items-center gap-1.5 text-white">
          <Token className="size-3.5" />
          <span className="text-13 font-medium">
            {formatNumber(reward, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}
