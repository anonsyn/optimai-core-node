import { apiClient } from '@/libs/axios'
import {
  CommunityMission,
  EngagementMission,
  GetCommunityMissionsResponse,
  GetDashboardMissionsResponse,
  GetEngagementMissionsResponse,
  GetNetworkMissionsResponse,
  GetStatsResponse,
  NetworkMission,
  VerifyEngagementMissionRequest,
} from './type'

export const missionApi = {
  getStats() {
    return apiClient.get<GetStatsResponse>('/missions/stats')
  },
  getNetworkMissions() {
    return apiClient.get<GetNetworkMissionsResponse>('/missions/networks/tasks')
  },
  getNetworkMissionById(id: string) {
    return apiClient.get<NetworkMission>(`/missions/networks/tasks/${id}`)
  },
  verifyNetworkMission(id: string, request?: VerifyEngagementMissionRequest) {
    return apiClient.post<GetEngagementMissionsResponse>(
      `/missions/networks/tasks/${id}/start`,
      request
    )
  },
  getEngagementMissions() {
    return apiClient.get<GetEngagementMissionsResponse>('/missions/engagement/tasks')
  },
  getEngagementMissionById(id: string) {
    return apiClient.get<EngagementMission>(`/missions/engagement/tasks/${id}`)
  },
  verifyEngagementMission(id: string, request?: VerifyEngagementMissionRequest) {
    return apiClient.post(`/missions/engagement/tasks/${id}/start`, request)
  },
  getCommunityMissions() {
    return apiClient.get<GetCommunityMissionsResponse>('/missions/social-tasks')
  },
  getCommunityMissionById(id: string) {
    return apiClient.get<CommunityMission>(`/missions/social-tasks/${id}`)
  },
  verifyCommunityMission(id: string, request?: VerifyEngagementMissionRequest) {
    return apiClient.post(`/missions/social-tasks/${id}/start`, request)
  },
  getDashboardMissions() {
    return apiClient.get<GetDashboardMissionsResponse>('/missions/tasks-in-dash')
  },
}

export * from './type'
