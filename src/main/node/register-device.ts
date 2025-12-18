import { deviceApi } from '../api/device'
import { DeviceType } from '../api/device/types'
import log from '../configs/logger'
import {
  deviceIdMissingError,
  deviceNoUserError,
  deviceRegistrationFailedError,
  deviceResponseDecodeError
} from '../errors/error-factory'
import { eventsService } from '../services/events-service'
import { deviceStore, userStore } from '../storage'
import { getFullDeviceInfo } from '../utils/device-info'
import { decode, encode } from '../utils/encoder'
import { getErrorMessage } from '../utils/get-error-message'
import { ensureError } from '../utils/ensure-error'

interface RegisterDeviceOptions {
  signal?: AbortSignal
  force?: boolean
}

export async function registerDevice({
  signal,
  force
}: RegisterDeviceOptions = {}): Promise<string> {
  const user = userStore.getUser()
  if (!user) {
    throw ensureError(deviceNoUserError())
  }

  if (deviceStore.isRegistered() && !force) {
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

  const encodedMessage = encode(JSON.stringify(payload))
  log.info('[register-device] Encoded payload length:', encodedMessage.length)

  let response: Awaited<ReturnType<typeof deviceApi.registerDevice>>
  try {
    response = await deviceApi.registerDevice({ data: encodedMessage }, signal)
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to register device')
    log.error('[register-device] Device registration failed:', errorMessage)
    const appError = deviceRegistrationFailedError(errorMessage)
    await eventsService.reportError({
      type: 'device.registration_failed',
      message: 'Device registration request failed',
      error,
      metadata: {
        encodedMessage: encodedMessage,
        deviceInfo,
        errorCode: appError.code
      }
    })
    throw ensureError(appError)
  }

  const { data } = response
  log.info('[register-device] Server response:', data)

  try {
    const decoded = decode(data.data)
    log.info('[register-device] Decoded response:', decoded)
    const parsed = JSON.parse(decoded) as { device_id?: unknown }
    const deviceId = typeof parsed.device_id === 'string' ? parsed.device_id : undefined

    if (!deviceId) {
      throw ensureError(deviceIdMissingError())
    }

    deviceStore.saveDeviceId(deviceId)
    return deviceId
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to decode device registration response')
    log.error('[register-device] Failed to decode device registration response:', errorMessage)
    const appError = deviceResponseDecodeError(errorMessage)
    await eventsService.reportError({
      type: 'device.registration_response_invalid',
      message: errorMessage,
      error,
      metadata: {
        encodedMessage: encodedMessage,
        responsePreview: typeof data?.data === 'string' ? data.data.slice(0, 200) : undefined,
        errorCode: appError.code
      }
    })
    throw ensureError(appError)
  }
}
