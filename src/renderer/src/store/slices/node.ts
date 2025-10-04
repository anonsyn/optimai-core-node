import { RootState } from '@/store'
import {
  NodeStatus,
  NodeStatusResponse,
  MiningWorkerStatus,
  MiningAssignment
} from '@main/node/types'
import { UptimeData } from '@main/storage/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface NodeReward {
  amount: string
  timestamp: number
}

export interface NodeState {
  // Node status
  deviceId?: string
  userIpId?: string
  status: NodeStatus
  nodeStatusResponse?: NodeStatusResponse
  lastError?: string

  // Uptime tracking
  cycle?: UptimeData
  latestReward?: NodeReward

  // Mining
  miningStatus?: MiningWorkerStatus
  miningAssignments: MiningAssignment[]
  currentAssignmentId?: string
}

const initialState: NodeState = {
  status: NodeStatus.Idle,
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

    // Node status
    setNodeStatus: (state, action: PayloadAction<NodeStatusResponse>) => {
      state.nodeStatusResponse = action.payload
      // Map the string status to the enum
      const statusMap: Record<string, NodeStatus> = {
        idle: NodeStatus.Idle,
        starting: NodeStatus.Starting,
        running: NodeStatus.Running,
        restarting: NodeStatus.Restarting,
        stopping: NodeStatus.Stopping
      }
      state.status = statusMap[action.payload.status] || NodeStatus.Idle
      state.lastError = action.payload.last_error || undefined
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
    setNodeError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload
    },
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

  // Node status selectors
  status: (state: RootState) => state.node.status,
  nodeStatusResponse: (state: RootState) => state.node.nodeStatusResponse,
  isRunning: (state: RootState) => state.node.status === NodeStatus.Running,
  isStarting: (state: RootState) => state.node.status === NodeStatus.Starting,
  isStopping: (state: RootState) => state.node.status === NodeStatus.Stopping,
  lastError: (state: RootState) => state.node.lastError,

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
  miningError: (state: RootState) => state.node.miningStatus?.lastError
}

export default nodeSlice
