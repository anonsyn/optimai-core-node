import AnimatedNumber from '@/components/ui/animated-number'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/tw'
import {
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Globe,
  PlayCircle,
  TrendingUp,
  Hash
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface MiningStats {
  total_rewards: {
    amount: number
    percentage_change: number
    period: string
  }
  weekly_rank: {
    current: number
    previous: number
  }
  data_points: number
  data_storage: number
  data_distribution: {
    video: number
    text: number
    image: number
    audio: number
  }
}

interface MiningAssignment {
  id: string
  status: string
  task: {
    id: string
    platform: string
    source_url?: string
    title?: string
    snippet?: string
    reward_amount?: string
  }
  started_at?: string
  completed_at?: string
  failed_at?: string
}

const DataMiningPage = () => {
  const [stats, setStats] = useState<MiningStats | null>(null)
  const [assignments, setAssignments] = useState<MiningAssignment[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch mining stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true)
        const data = await window.nodeIPC.getMiningStatsApi()
        if (data) {
          setStats(data)
        }
      } catch (err) {
        console.error('Failed to fetch mining stats:', err)
        setError('Failed to load mining statistics')
      } finally {
        setLoadingStats(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoadingAssignments(true)
        const data = await window.nodeIPC.getMiningAssignmentsApi({
          limit: 20,
          statuses: ['not_started', 'in_progress', 'completed', 'failed']
        })
        if (data) {
          setAssignments(data.assignments || [])
        }
      } catch (err) {
        console.error('Failed to fetch assignments:', err)
      } finally {
        setLoadingAssignments(false)
      }
    }

    fetchAssignments()
    // Refresh assignments every 10 seconds
    const interval = setInterval(fetchAssignments, 10000)
    return () => clearInterval(interval)
  }, [])

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-green-500/10 text-green-500 border-green-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      not_started: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }

    return (
      <Badge className={cn('capitalize', variants[status.toLowerCase()] || variants.not_started)}>
        {status.replace('_', ' ')}
      </Badge>
    )
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

  const formatTimeAgo = (timestamp: string | undefined) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Data Mining</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your mining performance and manage assignments
          </p>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Stats Column - Takes up 1 column */}
        <div className="space-y-4 lg:col-span-1">
          {/* Total Rewards Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Rewards
                </span>
                {loadingStats ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  stats && (
                    <span
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        stats.total_rewards.percentage_change >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      )}
                    >
                      {stats.total_rewards.percentage_change >= 0 ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {Math.abs(stats.total_rewards.percentage_change).toFixed(1)}%
                    </span>
                  )
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-10 w-full" />
              ) : stats ? (
                <div>
                  <div className="text-3xl font-bold">
                    <AnimatedNumber value={stats.total_rewards.amount} />
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {stats.total_rewards.period} change
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Rank Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Weekly Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-10 w-full" />
              ) : stats ? (
                <div>
                  <div className="text-3xl font-bold">#{stats.weekly_rank.current || '-'}</div>
                  {stats.weekly_rank.previous > 0 && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Previous: #{stats.weekly_rank.previous}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Data Points Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-10 w-full" />
              ) : stats ? (
                <div>
                  <div className="text-3xl font-bold">
                    <AnimatedNumber value={stats.data_points} />
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {stats.data_storage.toFixed(2)} GB storage
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Data Distribution Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Data Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-32 w-full" />
              ) : stats ? (
                <div className="space-y-3">
                  {Object.entries(stats.data_distribution).map(([type, percentage]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{type}</span>
                        <span className="font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="bg-secondary/50 h-2 overflow-hidden rounded-full">
                        <div
                          className="bg-primary/50 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignments Column - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>Your latest mining task assignments</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {loadingAssignments ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : assignments.length > 0 ? (
                <div className="h-full space-y-3 overflow-auto pr-2">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-secondary/30 hover:bg-secondary/50 rounded-lg border border-white/4 p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(assignment.status)}
                              {getStatusBadge(assignment.status)}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1.5">
                              {getPlatformIcon(assignment.task.platform)}
                              <span className="text-xs capitalize">{assignment.task.platform}</span>
                            </div>
                            {assignment.task.reward_amount && (
                              <Badge className="border-white/10 text-xs">
                                +{assignment.task.reward_amount} points
                              </Badge>
                            )}
                          </div>

                          {assignment.task.title && (
                            <p className="line-clamp-1 text-sm font-medium">
                              {assignment.task.title}
                            </p>
                          )}

                          {assignment.task.snippet && (
                            <p className="text-muted-foreground line-clamp-2 text-xs">
                              {assignment.task.snippet}
                            </p>
                          )}

                          <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            {assignment.started_at && (
                              <span>Started: {formatTimeAgo(assignment.started_at)}</span>
                            )}
                            {assignment.completed_at && (
                              <span>Completed: {formatTimeAgo(assignment.completed_at)}</span>
                            )}
                            {assignment.failed_at && (
                              <span>Failed: {formatTimeAgo(assignment.failed_at)}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-muted-foreground text-xs">
                          ID: {assignment.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No assignments found</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Assignments will appear here when available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DataMiningPage
