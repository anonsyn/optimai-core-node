import { RootState } from '@/store'
import { MiningAssignment, MiningWorkerStatus } from '@main/node/types'
import { UptimeData } from '@main/storage/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NodeReward {
  amount: string
  timestamp: number
}

export interface NodeState {
  // Device info
  deviceId?: string
  userIpId?: string

  // Uptime tracking
  cycle?: UptimeData
  latestReward?: NodeReward

  // Mining
  miningStatus?: MiningWorkerStatus
  miningAssignments: MiningAssignment[]
  currentAssignmentId?: string
}

const initialState: NodeState = {
  miningAssignments: []
}

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

    // Uptime
    setUptimeCycle: (state, action: PayloadAction<UptimeData>) => {
      state.cycle = action.payload
    },
    setUptimeReward: (state, action: PayloadAction<NodeReward>) => {
      state.latestReward = action.payload
    },

    // Mining
    setMiningStatus: (state, action: PayloadAction<MiningWorkerStatus>) => {
      state.miningStatus = action.payload
    },
    setMiningAssignments: (state, action: PayloadAction<MiningAssignment[]>) => {
      state.miningAssignments = action.payload
    },
    setMiningAssignmentStarted: (state, action: PayloadAction<string>) => {
      state.currentAssignmentId = action.payload
      // Update the assignment status in the list
      const assignment = state.miningAssignments.find((a) => a.id === action.payload)
      if (assignment) {
        assignment.status = 'in_progress'
      }
    },
    setMiningAssignmentCompleted: (state, action: PayloadAction<string>) => {
      if (state.currentAssignmentId === action.payload) {
        state.currentAssignmentId = undefined
      }
      // Update the assignment status in the list
      const assignment = state.miningAssignments.find((a) => a.id === action.payload)
      if (assignment) {
        assignment.status = 'completed'
      }
    },

    // Error handling
    setMiningError: (state, action: PayloadAction<string>) => {
      if (state.miningStatus) {
        state.miningStatus.lastError = action.payload
      }
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

  // Uptime selectors
  cycle: (state: RootState) => state.node.cycle,
  latestReward: (state: RootState) => state.node.latestReward,

  // Mining selectors
  miningStatus: (state: RootState) => state.node.miningStatus,
  miningAssignments: (state: RootState) => state.node.miningAssignments,
  currentAssignmentId: (state: RootState) => state.node.currentAssignmentId,
  currentAssignment: (state: RootState) => {
    const id = state.node.currentAssignmentId
    return id ? state.node.miningAssignments.find((a) => a.id === id) : undefined
  },
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
