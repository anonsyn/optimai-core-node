import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUserDeviceStore } from '@/hooks/use-user-deivce-store'
import { useUserUptimeRewardStore } from '@/hooks/use-user-last-uptime-reward-store'
import { useUserUptimeRewardCountStore } from '@/hooks/use-user-uptime-reward-count-store'
import { useUserUptimeStore } from '@/hooks/use-user-uptime-store'
import { deviceService, DeviceType } from '@/services/device'
import { uptimeService } from '@/services/uptime'
import { store } from '@/store'
import { authSelectors } from '@/store/slices/auth'
import { notificationActions } from '@/store/slices/notification'
import { socketActions, socketSelectors } from '@/store/slices/socket'
import { getFullDeviceInfo } from '@/utils/device-info'
import { decode, encode } from '@/utils/encoder'
import { getErrorMessage } from '@/utils/get-error-message'
import { nanoid } from '@reduxjs/toolkit'
import { useQueryClient } from '@tanstack/react-query'
import pRetry from 'p-retry'
import { PropsWithChildren, useEffect } from 'react'

export interface ProxyTask {
  id: string
  task_id: string
  title: string
  connection_id: string
}

export type WebsocketBaseEvent<T extends string, D = any> = {
  type: T
  data: D
}

export type WebsocketProxyTaskAssignmentEvent = WebsocketBaseEvent<
  'proxy_task_assignment',
  ProxyTask
>

export type WebSocketConnectionEstablishedEvent = WebsocketBaseEvent<
  'conn_established',
  { user_ip_id: string }
>

export type UptimeUpdatedMessage = {
  assignment_id: string
  task_id: string
  reward: number
  timestamp: string
}

export type UptimeUpdatedEvent = WebsocketBaseEvent<'uptime_updated', UptimeUpdatedMessage>

type ProxyTaskCompletionMessage = {
  assignment_id: string
  task_id: string
  reward: number
  timestamp: string
}

export type ProxyTaskCompletionEvent = WebsocketBaseEvent<
  'proxy_task_completion',
  ProxyTaskCompletionMessage
>

export type WebsocketEvent =
  | WebsocketProxyTaskAssignmentEvent
  | WebSocketConnectionEstablishedEvent
  | UptimeUpdatedEvent
  | ProxyTaskCompletionEvent

// const usePushNotification = () => {
//   const dispatch = useAppDispatch()
//   const timeoutId = useRef<number>()

//   return useCallback((notification: Omit<Notification, 'id'>) => {
//     window.clearTimeout(timeoutId.current)
//     dispatch(notificationActions.pushNotification(notification))
//     timeoutId.current = window.setTimeout(() => {
//       // dispatch(notificationActions.removeNotification());
//     }, 6000)
//   }, [])
// }

const useTelegramNode = () => {
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)
  const dispatch = useAppDispatch()

  const deviceStore = useUserDeviceStore()

  useEffect(() => {
    if (isSignedIn) {
      let mounted = true
      const registerDevice = async () => {
        const deviceData = deviceStore.getData()
        if (deviceData && deviceData.deviceId) {
          const { deviceId, active } = deviceData
          dispatch(socketActions.setActive(active))
          dispatch(socketActions.setDeviceId(deviceId))
        } else {
          const { deviceInfo } = await getFullDeviceInfo()

          const user_id = store.getState().auth.user?.id || ''

          const res = await deviceService.registerDeviceV2({
            data: encode(
              JSON.stringify({
                user_id,
                device_info: deviceInfo,
                device_type: DeviceType.PC,
                timestamp: Date.now()
              })
            )
          })

          const json = JSON.parse(decode(res.data.data))

          const device_id = json.device_id
          deviceStore.setData({
            deviceId: device_id,
            active: true
          })

          dispatch(socketActions.setDeviceId(device_id))
          dispatch(socketActions.setActive(true))
        }
      }
      pRetry(registerDevice, {
        retries: 15,
        minTimeout: 2000,
        shouldRetry: (e) => {
          console.log({ e })
          return mounted
        }
      })

      return () => {
        mounted = false
      }
    }
  }, [isSignedIn])
}

const useUptimeMonitor = () => {
  const deviceId = useAppSelector(socketSelectors.deviceId)
  const userId = useAppSelector(authSelectors.userId)

  const uptimeStore = useUserUptimeStore()
  const deviceStore = useUserDeviceStore()
  const uptimeRewardStore = useUserUptimeRewardStore()
  const uptimeRewardCountStore = useUserUptimeRewardCountStore()
  const dispatch = useAppDispatch()

  const queryClient = useQueryClient()

  const notificationStore = useUserUptimeRewardStore()

  useEffect(() => {
    const notification = notificationStore.getData()

    if (notification) {
      dispatch(notificationActions.pushNotification(notification))
    }
  }, [notificationStore])

  useEffect(() => {
    if (deviceId) {
      let monitorId: number
      let mounted = true
      const trackDuration = 1000 * 0.5

      const { refreshAt } = uptimeStore.getData()
      dispatch(notificationActions.setNextUptimeReward(refreshAt))

      const latestReward = uptimeRewardStore.getData()
      const latestTimestamp = latestReward?.timestamp || Date.now()
      dispatch(notificationActions.setLatestUptime(latestTimestamp))

      const monitor = async () => {
        const isExpired = uptimeStore.isExpired()

        const logUptime = async () => {
          const timestamp = Date.now()
          try {
            const uptimeData = uptimeStore.getData()
            const { uptime, createdAt, refreshAt } = uptimeData

            let duration = uptime
            if (refreshAt - createdAt !== 0) {
              duration = Math.min(uptime, refreshAt - createdAt)
            }

            console.log({ duration })

            if (duration > 1000) {
              const requestData = {
                duration,
                user_id: userId,
                device_id: deviceId,
                device_type: 'telegram',
                timestamp
              }

              const encodedData = encode(JSON.stringify(requestData))

              const response = await uptimeService.logUptime({
                data: encodedData
              })
              const data = response.data.data
              const parsedData = JSON.parse(decode(data))
              const reward = parsedData.reward
              const userIdIp = parsedData.user_ip_id || ''

              deviceStore.userIpId = userIdIp
              dispatch(socketActions.setUserIpId(userIdIp))
              const notification = {
                id: nanoid(),
                reward,
                timestamp
              }
              dispatch(notificationActions.pushNotification(notification))
              uptimeRewardStore.setData(notification)
            }
          } catch (error) {
            const message = getErrorMessage(error, 'Unknown error')
            console.error('Error in logUptime:', message)
          } finally {
            dispatch(notificationActions.setLatestUptime(Date.now()))
          }
        }
        if (isExpired) {
          await logUptime()
          const shouldIncreaseTimes = uptimeRewardCountStore.count > 15
          const cycle = uptimeStore.createCycle(shouldIncreaseTimes)
          console.log({ cycle })
          uptimeRewardCountStore.increaseCount()
          queryClient.invalidateQueries({
            queryKey: ['dashboard-stats']
          })
          dispatch(notificationActions.setNextUptimeReward(cycle.refreshAt))
        } else {
          const isOnline = store.getState().online.isOnline
          if (isOnline) {
            uptimeStore.updateUptime(trackDuration)
          }
        }

        if (!mounted) {
          return
        }

        monitorId = window.setTimeout(monitor, trackDuration)
      }
      monitor()

      return () => {
        mounted = false
        if (monitorId) {
          clearTimeout(monitorId)
        }
      }
    }
  }, [deviceId])
}

const NodeProvider = ({ children }: PropsWithChildren) => {
  useTelegramNode()
  useUptimeMonitor()
  return <>{children}</>
}

export default NodeProvider
