import { RootState } from '@/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  reward: number
  timestamp: number
}

export interface NotificationState {
  notification?: Notification
  nextUptimeReward: number
  latestUptime: number
  uptimeCount: number
  proxyCount: number
}

const initialState: NotificationState = {
  nextUptimeReward: 0,
  latestUptime: 0,
  uptimeCount: 0,
  proxyCount: 0,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    pushNotification: (state, action: PayloadAction<Notification>) => {
      state.notification = action.payload
    },
    setNextUptimeReward: (state, action: PayloadAction<number>) => {
      state.nextUptimeReward = action.payload
    },
    setLatestUptime: (state, action: PayloadAction<number>) => {
      state.latestUptime = action.payload
    },
    removeNotification: (state) => {
      state.notification = undefined
    },
    incrementUptimeCount: (state) => {
      state.uptimeCount += 1
    },
    incrementProxyCount: (state, action: PayloadAction<number>) => {
      state.proxyCount += action.payload
    },
    resetProxyCount: (state) => {
      state.proxyCount = 0
    },
    resetUptimeCount: (state) => {
      state.uptimeCount = 0
    },
  },
})

export const notificationActions = {
  ...notificationSlice.actions,
}

export const notificationSelectors = {
  notification: (state: RootState) => state.notification.notification,
  uptimeCount: (state: RootState) => state.notification.uptimeCount,
  proxyCount: (state: RootState) => state.notification.proxyCount,
  nextUptimeReward: (state: RootState) => state.notification.nextUptimeReward,
  latestUptime: (state: RootState) => state.notification.latestUptime,
}

export default notificationSlice
