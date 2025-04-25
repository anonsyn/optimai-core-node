import axiosClient from '@/libs/axios'
import {
  GetDeviceByIdResponse,
  GetDevicesParams,
  GetDevicesResponse,
  RegisterDeviceRequest,
  RegisterDeviceRequestV2,
  RegisterDeviceResponse,
  RegisterDeviceResponseV2,
} from './type'

export const deviceService = {
  getDevices(params: GetDevicesParams) {
    return axiosClient.get<GetDevicesResponse>('/devices', { params })
  },
  getDeviceById(deviceId: string) {
    return axiosClient.get<GetDeviceByIdResponse>(`/devices/${deviceId}`)
  },
  registerDevice(token: string, request: RegisterDeviceRequest, signal?: AbortSignal) {
    return axiosClient.post<RegisterDeviceResponse>('/devices/register', request, {
      headers: {
        'x-client-authentication': token,
      },
      signal,
    })
  },

  registerDeviceV2(request: RegisterDeviceRequestV2, signal?: AbortSignal) {
    return axiosClient.post<RegisterDeviceResponseV2>('/devices/register-v2', request, {
      signal,
    })
  },
}

export * from './type'
