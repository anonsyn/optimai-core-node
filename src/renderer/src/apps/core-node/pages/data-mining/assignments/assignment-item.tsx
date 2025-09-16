import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tw'
import { MiningAssignment } from '@main/node/types'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Globe,
  Hash,
  PlayCircle
} from 'lucide-react'

interface AssignmentItemProps {
  assignment: MiningAssignment
}

export const AssignmentItem = ({ assignment }: AssignmentItemProps) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'google':
        return <Globe className="h-4 w-4" />
      case 'twitter':
        return <Hash className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const formatTaskId = (id: string) => {
    return id.slice(0, 8) + '...' + id.slice(-4)
  }

  return (
    <div className="bg-secondary/40 hover:bg-secondary/50 group flex items-start gap-3 rounded-lg px-4 py-3 transition-colors">
      <div className="mt-0.5">{getStatusIcon(assignment.status)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Task: {formatTaskId(assignment.task.id)}
              </span>
              <div className="text-muted-foreground flex items-center gap-1">
                {getPlatformIcon(assignment.task.platform)}
                <span className="text-xs capitalize">{assignment.task.platform}</span>
              </div>
            </div>
            {assignment.task.title && (
              <p className="line-clamp-1 text-sm font-medium">{assignment.task.title}</p>
            )}
            {assignment.task.snippet && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {assignment.task.snippet}
              </p>
            )}
            {assignment.task.source_url && (
              <a
                href={assignment.task.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 mt-1 inline-flex items-center gap-1 text-xs"
              >
                <span className="max-w-[200px] truncate">
                  {new URL(assignment.task.source_url).hostname}
                </span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="text-right">
            <Badge
              className={cn(
                'mb-1 text-xs capitalize',
                assignment.status === 'completed' &&
                  'border-green-500/20 bg-green-500/10 text-green-500',
                assignment.status === 'in_progress' &&
                  'border-blue-500/20 bg-blue-500/10 text-blue-500',
                assignment.status === 'failed' && 'border-red-500/20 bg-red-500/10 text-red-500',
                assignment.status === 'not_started' &&
                  'border-gray-500/20 bg-gray-500/10 text-gray-500'
              )}
            >
              {assignment.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
