import { RootState } from '@/store'
import { MiningWorkerStatus } from '@main/node/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NodeReward {
  amount: string
  timestamp: number
}

export interface NodeState {
  // Device info
  deviceId?: string
  userIpId?: string

  // Mining
  miningStatus?: MiningWorkerStatus
}

const initialState: NodeState = {}

const nodeSlice = createSlice({
  name: 'node',
  initialState,
  reducers: {
    // Basic setters
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload
    },
    setUserIpId: (state, action: PayloadAction<string>) => {
      state.userIpId = action.payload
    },
    // Mining
    setMiningStatus: (state, action: PayloadAction<MiningWorkerStatus>) => {
      state.miningStatus = action.payload
    },

    // Reset
    reset: () => initialState
  }
})

export const nodeActions = {
  ...nodeSlice.actions
}

export const nodeSelectors = {
  // Basic selectors
  deviceId: (state: RootState) => state.node.deviceId,
  userIpId: (state: RootState) => state.node.userIpId,

  // Mining selectors
  miningStatus: (state: RootState) => state.node.miningStatus,

  isMiningProcessing: (state: RootState) => state.node.miningStatus?.isProcessing || false,
  miningError: (state: RootState) => state.node.miningStatus?.lastError,

  // Derived selectors
  isRunning: (state: RootState) => {
    // Node is considered running if mining worker is active
    const status = state.node.miningStatus?.status
    return status !== undefined && status !== 'stopped' && status !== 'idle'
  }
}

export default nodeSlice
