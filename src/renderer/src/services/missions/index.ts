import axiosClient from '@/libs/axios'
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

export const missionService = {
  getStats() {
    return axiosClient.get<GetStatsResponse>('/missions/stats')
  },
  getNetworkMissions() {
    return axiosClient.get<GetNetworkMissionsResponse>('/missions/networks/tasks')
  },
  getNetworkMissionById(id: string) {
    return axiosClient.get<NetworkMission>(`/missions/networks/tasks/${id}`)
  },
  verifyNetworkMission(id: string, request?: VerifyEngagementMissionRequest) {
    return axiosClient.post<GetEngagementMissionsResponse>(
      `/missions/networks/tasks/${id}/start`,
      request
    )
  },
  getEngagementMissions() {
    return axiosClient.get<GetEngagementMissionsResponse>('/missions/engagement/tasks')
  },
  getEngagementMissionById(id: string) {
    return axiosClient.get<EngagementMission>(`/missions/engagement/tasks/${id}`)
  },
  verifyEngagementMission(id: string, request?: VerifyEngagementMissionRequest) {
    return axiosClient.post(`/missions/engagement/tasks/${id}/start`, request)
  },
  getCommunityMissions() {
    return axiosClient.get<GetCommunityMissionsResponse>('/missions/social-tasks')
  },
  getCommunityMissionById(id: string) {
    return axiosClient.get<CommunityMission>(`/missions/social-tasks/${id}`)
  },
  verifyCommunityMission(id: string, request?: VerifyEngagementMissionRequest) {
    return axiosClient.post(`/missions/social-tasks/${id}/start`, request)
  },
  getDashboardMissions() {
    return axiosClient.get<GetDashboardMissionsResponse>('/missions/tasks-in-dash')
  },
}

export * from './type'
