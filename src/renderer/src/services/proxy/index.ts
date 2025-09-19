import { apiClient } from '@/libs/axios'
import { AxiosRequestConfig } from 'axios'
import {
  GetAssignmentByIdResponse,
  GetAssignmentsParams,
  GetAssignmentsResponse,
  GetProxyNetworkParams,
  GetProxyNetworksResponse,
  GetProxyRequestsParams,
  GetProxyRequestsResponse,
  GetProxyRewardsParams,
  GetProxyRewardsResponse,
  GetProxyStatsResponse,
  SubmitAssignmentRequest,
  UpdateAssignmentStatusRequest,
} from './type'

export const proxyService = {
  getStats() {
    return apiClient.get<GetProxyStatsResponse>('/proxies/stats')
  },
  getRequests(params: GetProxyRequestsParams) {
    return apiClient.get<GetProxyRequestsResponse>('/proxies/requests', { params })
  },
  getNetworks(params: GetProxyNetworkParams) {
    return apiClient.get<GetProxyNetworksResponse>('/proxies/networks', { params })
  },
  getAssignments(params: GetAssignmentsParams, config?: AxiosRequestConfig) {
    const { status, ...restParams } = params
    let queryString = ''
    if (status) {
      if (Array.isArray(status)) {
        queryString = status.map((item) => `status=${item}`).join('&')
      } else {
        queryString = `status=${status}`
      }
    }
    return apiClient.get<GetAssignmentsResponse>(`/proxies/assignments?${queryString}`, {
      params: { ...restParams },
      ...config,
    })
  },
  getAssignmentById(id: string) {
    return apiClient.get<GetAssignmentByIdResponse>(`/proxies/assignments/${id}`)
  },
  updateAssignmentStatus(id: string, request: UpdateAssignmentStatusRequest) {
    return apiClient.put(`/proxies/assignments/${id}/status`, request)
  },
  submitAssignment(id: string, request: SubmitAssignmentRequest) {
    return apiClient.post(`/proxies/assignments/${id}/submit`, request)
  },
  getProxyRewards(params?: GetProxyRewardsParams) {
    return apiClient.get<GetProxyRewardsResponse>('/proxies/rewards', {
      params,
    })
  },
}

export * from './type'
