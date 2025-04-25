import axiosClient from '@/libs/axios'
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
    return axiosClient.get<GetProxyStatsResponse>('/proxies/stats')
  },
  getRequests(params: GetProxyRequestsParams) {
    return axiosClient.get<GetProxyRequestsResponse>('/proxies/requests', { params })
  },
  getNetworks(params: GetProxyNetworkParams) {
    return axiosClient.get<GetProxyNetworksResponse>('/proxies/networks', { params })
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
    return axiosClient.get<GetAssignmentsResponse>(`/proxies/assignments?${queryString}`, {
      params: { ...restParams },
      ...config,
    })
  },
  getAssignmentById(id: string) {
    return axiosClient.get<GetAssignmentByIdResponse>(`/proxies/assignments/${id}`)
  },
  updateAssignmentStatus(id: string, request: UpdateAssignmentStatusRequest) {
    return axiosClient.put(`/proxies/assignments/${id}/status`, request)
  },
  submitAssignment(id: string, request: SubmitAssignmentRequest) {
    return axiosClient.post(`/proxies/assignments/${id}/submit`, request)
  },
  getProxyRewards(params?: GetProxyRewardsParams) {
    return axiosClient.get<GetProxyRewardsResponse>('/proxies/rewards', {
      params,
    })
  },
}

export * from './type'
