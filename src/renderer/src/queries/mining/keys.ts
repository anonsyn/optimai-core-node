import { GetMiningAssignmentsParams } from '@/api/mining'

export const miningKeys = {
  stats: () => ['mining-stats'] as const,
  assignments: (params?: GetMiningAssignmentsParams) => ['mining-assignments', params] as const,
  assignmentDetail: (assignmentId: string) => ['mining-assignment-detail', assignmentId] as const
}
