import { RootState } from '@/store'
import { NodeStatus } from '@main/node/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NodeCycle {
  uptime: number
  createdAt: number
  updatedAt: number
  refreshAt: number
}

export interface NodeReward {
  amount: string
  timestamp: number
}

export interface NodeState {
  deviceId?: string
  userIpId?: string
  status?: NodeStatus
  cycle?: NodeCycle
  latestNotificationReward?: NodeReward
}

const initialState: NodeState = {
  status: NodeStatus.Idle
}

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload
    },
    setUserIpId: (state, action: PayloadAction<string>) => {
      state.userIpId = action.payload
    },
    setStatus: (state, action: PayloadAction<NodeState['status']>) => {
      state.status = action.payload
    },
    setCycle: (state, action: PayloadAction<NodeCycle>) => {
      state.cycle = action.payload
    },
    setLatestNotificationReward: (state, action: PayloadAction<NodeReward>) => {
      state.latestNotificationReward = action.payload
    }
  }
})

export const nodeActions = {
  ...nodeSlice.actions
}

export const nodeSelectors = {
  deviceId: (state: RootState) => state.node.deviceId,
  userIpId: (state: RootState) => state.node.userIpId,
  status: (state: RootState) => state.node.status,
  isRunning: (state: RootState) => state.node.status === NodeStatus.Running,
  cycle: (state: RootState) => state.node.cycle,
  latestNotificationReward: (state: RootState) => state.node.latestNotificationReward
}

export default nodeSlice
