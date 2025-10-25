import log from '../configs/logger'
import { deviceApi } from '../api/device'
import { DeviceType } from '../api/device/types'
import { eventsService } from '../services/events-service'
import { deviceStore, userStore } from '../storage'
import { getFullDeviceInfo } from '../utils/device-info'
import { decode, encode } from '../utils/encoder'
import { getErrorMessage } from '../utils/get-error-message'

export async function registerDevice(signal?: AbortSignal): Promise<string> {
  const user = userStore.getUser()
  if (!user) {
    throw new Error('Cannot register device without an authenticated user')
  }

  if (deviceStore.isRegistered()) {
    const existingDeviceId = deviceStore.getDeviceId()
    if (existingDeviceId) {
      log.info('[register-device] Device already registered, reusing ID:', existingDeviceId)
      return existingDeviceId
    }
  }

  log.info('[register-device] User info:', { id: user.id, email: user.email })

  const { deviceInfo } = await getFullDeviceInfo()
  log.info('[register-device] Device info:', deviceInfo)

  const payload = {
    user_id: user.id,
    device_info: {
      ...deviceInfo,
      device_type: DeviceType.PC
    },
    device_type: DeviceType.PC,
    timestamp: Date.now()
  }

  // Log the payload before encoding for debugging
  log.info('[register-device] Payload before encoding:', JSON.stringify(payload, null, 2))

  const encodedPayload = encode(JSON.stringify(payload))
  log.info('[register-device] Encoded payload length:', encodedPayload.length)

  let response: Awaited<ReturnType<typeof deviceApi.registerDevice>>
  try {
    response = await deviceApi.registerDevice({ data: encodedPayload }, signal)
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to register device')
    log.error('[register-device] Device registration failed:', errorMessage)
    await eventsService.reportError({
      type: 'device.registration_failed',
      message: 'Device registration request failed',
      error,
      metadata: {
        payloadSize: encodedPayload.length,
        deviceInfo
      }
    })
    throw error
  }

  const { data } = response
  log.info('[register-device] Server response:', data)

  try {
    const decoded = decode(data.data)
    log.info('[register-device] Decoded response:', decoded)
    const parsed = JSON.parse(decoded) as { device_id?: unknown }
    const deviceId = typeof parsed.device_id === 'string' ? parsed.device_id : undefined

    if (!deviceId) {
      throw new Error('Device ID missing in server response')
    }

    deviceStore.saveDeviceId(deviceId)
    return deviceId
  } catch (error) {
    const errorMessage = getErrorMessage(
      error,
      'Failed to decode device registration response'
    )
    log.error('[register-device] Failed to decode device registration response:', errorMessage)
    await eventsService.reportError({
      type: 'device.registration_response_invalid',
      message: 'Failed to decode device registration response',
      error,
      metadata: {
        payloadSize: encodedPayload.length,
        responsePreview: typeof data?.data === 'string' ? data.data.slice(0, 200) : undefined
      }
    })
    throw new Error('Failed to decode device registration response')
  }
}
