import {
  Mission,
  missionService,
  MissionType,
  VerifyEngagementMissionRequest,
} from '@/services/missions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RQUERY as COMMUNITY_MISSIONS_QUERY } from './use-get-community-missions-query'
import { RQUERY as ENGAGEMENT_MISSIONS_QUERY } from './use-get-engagement-missions-query'
import { RQUERY as NETWORK_MISSIONS_QUERY } from './use-get-network-missions-query'

export const useVerifyTaskMutationFn = (task: Mission, taskType: MissionType) => {
  return async (request?: VerifyEngagementMissionRequest) => {
    if (taskType === MissionType.COMMUNITY) {
      return missionService.verifyCommunityMission(task.id, request)
    }

    if (taskType === MissionType.ENGAGEMENT) {
      return missionService.verifyEngagementMission(task.id, request)
    }

    return missionService.verifyNetworkMission(task.id, request)
  }
}

export const useInvalidateMissionsQuery = (taskType: MissionType) => {
  const queryClient = useQueryClient()

  return () => {
    if (taskType === MissionType.COMMUNITY) {
      return queryClient.invalidateQueries({ queryKey: COMMUNITY_MISSIONS_QUERY() })
    }

    if (taskType === MissionType.ENGAGEMENT) {
      return queryClient.invalidateQueries({ queryKey: ENGAGEMENT_MISSIONS_QUERY() })
    }

    return queryClient.invalidateQueries({ queryKey: NETWORK_MISSIONS_QUERY() })
  }
}

export const useVerifyTaskMutation = (task: Mission, taskType: MissionType) => {
  const mutationFn = useVerifyTaskMutationFn(task, taskType)

  return useMutation({
    mutationKey: ['verify-task', task.id],
    mutationFn,
  })
}
