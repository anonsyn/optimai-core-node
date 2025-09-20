import { deviceApi } from '../api/device'
import { DeviceType } from '../api/device/type'
import { deviceStore, userStore } from '../storage'
import { getFullDeviceInfo } from '../utils/device-info'
import { decode, encode } from '../utils/encoder'

export async function registerDevice(signal?: AbortSignal): Promise<string> {
  const user = userStore.getUser()
  if (!user) {
    throw new Error('Cannot register device without an authenticated user')
  }

  const { deviceInfo } = await getFullDeviceInfo()

  const payload = {
    user_id: user.id,
    device_info: {
      ...deviceInfo,
      device_type: DeviceType.PC
    },
    device_type: DeviceType.PC,
    timestamp: Date.now()
  }

  const encodedPayload = encode(JSON.stringify(payload))
  const { data } = await deviceApi.registerDevice({ data: encodedPayload }, signal)

  try {
    const decoded = decode(data.data)
    const parsed = JSON.parse(decoded) as { device_id?: unknown }
    const deviceId = typeof parsed.device_id === 'string' ? parsed.device_id : undefined

    if (!deviceId) {
      throw new Error('Device ID missing in server response')
    }

    deviceStore.saveDeviceId(deviceId)
    return deviceId
  } catch (error) {
    console.error('Failed to decode device registration response:', error)
    throw new Error('Failed to decode device registration response')
  }
}
