import { apiClient } from '../../libs/axios'
import type {
  GetDeviceByIdResponse,
  GetDevicesParams,
  GetDevicesResponse,
  RegisterDeviceRequest,
  RegisterDeviceResponse
} from './type'

export const deviceApi = {
  getDevices(params: GetDevicesParams) {
    return apiClient.get<GetDevicesResponse>('/devices', { params })
  },
  getDeviceById(deviceId: string) {
    return apiClient.get<GetDeviceByIdResponse>(`/devices/${deviceId}`)
  },
  registerDevice(request: RegisterDeviceRequest, signal?: AbortSignal) {
    return apiClient.post<RegisterDeviceResponse>('/devices/register-v2', request, {
      signal
    })
  }
}

export * from './type'
