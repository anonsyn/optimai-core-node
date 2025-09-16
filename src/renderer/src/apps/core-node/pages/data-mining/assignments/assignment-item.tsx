import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { formatNumber } from '@/utils/number'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import { formatDate } from 'date-fns'
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
        return 'text-positive'
      case 'in_progress':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
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
    <div className="bg-secondary/40 backdrop-blur-10 flex-1 rounded-xl border border-white/4">
      <div className="flex w-full items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center">
          <Icon className="mr-2 size-4.5 text-white" icon="Info" />
          <span className="text-16 leading-normal text-white/50">Task:&nbsp;</span>
          <span className="text-16 leading-normal text-white">{formatTaskId(id)}</span>
        </div>
        <div className="flex items-center gap-1">
          {getPlatformIcon()}
          <span className="text-16 leading-normal font-medium text-white capitalize">
            {platform}
          </span>
        </div>
        <div className={cn('flex items-center gap-1', getStatusColor())}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
      </div>
      <div className="flex min-h-[140px] flex-col px-4 pt-5 pb-5">
        <p className="text-16 leading-normal font-semibold text-white">{title}</p>
        {snippet && <p className="text-14 tracking-tight text-white/80">{snippet}</p>}
        <p className="text-16 mt-auto pt-4 text-white/50">{searchQuery || sourceUrl}</p>
      </div>
      <div className="flex items-center justify-end gap-3 bg-black/10 p-4">
        <div className="bg-raydial-10 flex h-9 items-center justify-center rounded-md border border-white/15 p-2 leading-none">
          {formatDate(updatedAt || Date.now(), 'MM/dd/yyyy HH:mm')}
        </div>
        <div className="bg-raydial-10 flex h-9 items-center justify-center gap-1 rounded-md border border-white/15 p-2 leading-none">
          <Token className="size-4.5" />
          <span className="font-semibold">
            {formatNumber(reward, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}
