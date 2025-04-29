import { RootState } from '@/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SocketState {
  deviceId?: string
  userIpId?: string
  active?: boolean
}

const initialState: SocketState = {
  active: true,
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload
    },
    setUserIpId: (state, action: PayloadAction<string>) => {
      state.userIpId = action.payload
    },
    setActive: (state, action: PayloadAction<SocketState['active']>) => {
      state.active = action.payload
    },
  },
})

export const socketActions = {
  ...socketSlice.actions,
}

export const socketSelectors = {
  deviceId: (state: RootState) => state.socket.deviceId,
  userIpId: (state: RootState) => state.socket.userIpId,
  active: (state: RootState) => state.socket.active,
}

export default socketSlice
