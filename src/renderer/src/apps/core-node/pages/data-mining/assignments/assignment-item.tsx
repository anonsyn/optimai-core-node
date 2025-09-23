import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { formatNumber } from '@/utils/number'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { formatDate } from 'date-fns'
import { motion } from 'framer-motion'
import lodash from 'lodash'
import { AlertCircle, CheckCircle, Clock, PlayCircle } from 'lucide-react'

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

  console.log({ assignment })

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green'
      case 'in_progress':
        return 'text-yellow'
      case 'failed':
        return 'text-destructive'
      default:
        return 'text-white/40'
    }
  }

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="size-4.5" />
      case 'in_progress':
        return <PlayCircle className="size-4.5" />
      case 'failed':
        return <AlertCircle className="size-4.5" />
      default:
        return <Clock className="size-4.5" />
    }
  }

  const getStatusText = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'failed':
        return 'Failed'
      default:
        return 'Not Started'
    }
  }

  const getPlatformIcon = () => {
    switch (platform?.toLowerCase()) {
      case 'google':
        return <Icon icon="Google" className="size-4.5" />
      case 'twitter':
        return <Icon icon="Twitter" className="size-4.5" />
      default:
        return <Icon icon="Globe" className="size-4.5" />
    }
  }

  const formatTaskId = (id: string) => {
    return id.slice(0, 8) + '...' + id.slice(-4)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-xl transition-all hover:border-white/10"
    >
      {/* Status Indicator Line */}
      <div
        className={cn(
          'absolute top-0 left-0 h-full w-1 transition-all',
          status.toLowerCase() === 'completed' && 'bg-green',
          status.toLowerCase() === 'in_progress' && 'bg-yellow',
          status.toLowerCase() === 'failed' && 'bg-destructive',
          !status && 'bg-white/20'
        )}
      />

      {/* Background Gradient on Hover */}
      <div className="from-yellow/5 to-green/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
            <Icon className="size-3.5 text-white/50" icon="Pickaxe" />
            <span className="text-12 font-medium text-white/50">{formatTaskId(id)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5">
            {getPlatformIcon()}
            <span className="text-12 font-medium text-white/70 capitalize">{platform}</span>
          </div>
        </div>
        <div className={cn('flex items-center gap-1.5', getStatusColor())}>
          {getStatusIcon()}
          <span className="text-12 font-semibold">{getStatusText()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex min-h-[120px] flex-col p-5">
        <h3 className="text-18 mb-2 leading-tight font-semibold text-white">{title}</h3>
        {snippet && (
          <p className="text-13 mb-3 line-clamp-2 leading-relaxed text-white/60">{snippet}</p>
        )}
        {(searchQuery || sourceUrl) && (
          <div className="mt-auto flex items-center gap-2">
            <Icon icon="Search" className="size-3.5 text-white/30" />
            <p className="text-12 line-clamp-1 text-white/40">{searchQuery || sourceUrl}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between border-t border-white/5 bg-black/20 px-5 py-3">
        <div className="text-12 flex items-center gap-2 text-white/40">
          <Icon icon="Timer" className="size-3.5" />
          <span>{formatDate(updatedAt || Date.now(), 'MMM dd, HH:mm')}</span>
        </div>
        <div className="bg-main flex items-center gap-1.5 rounded-full bg-clip-text px-3 py-1 font-bold text-transparent">
          <Token className="size-4" />
          <span className="text-14">
            {formatNumber(reward, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
