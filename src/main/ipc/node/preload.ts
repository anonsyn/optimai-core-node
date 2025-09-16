import { ipcRenderer } from 'electron'
import {
  NodeStatus,
  NodeStatusResponse,
  RewardResponse,
  ServerStatus,
  TokensResponse,
  UptimeProgressResponse,
  UserResponse,
  MiningStatsResponse,
  MiningAssignmentsResponse,
  MiningAssignment,
  PreferencesResponse,
  WorkerPreferences
} from '../../node/types'
import { createPreloadEventListener } from '../../utils/ipc'
import { NodeEvents } from './events'

const nodeIPC = {
  // API Server
  getServerStatus: (): Promise<ServerStatus> => ipcRenderer.invoke(NodeEvents.GetServerStatus),
  getServerUrl: (): Promise<string | null> => ipcRenderer.invoke(NodeEvents.GetServerUrl),
  getServerPort: (): Promise<number | null> => ipcRenderer.invoke(NodeEvents.GetServerPort),

  // WebSocket
  getWebSocketStatus: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.GetWebSocketStatus),

  // Node Operations
  startNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StartNode),
  stopNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StopNode),
  getNodeStatus: (): Promise<NodeStatusResponse | null> =>
    ipcRenderer.invoke(NodeEvents.GetNodeStatus),

  // API Calls - Authentication
  loginApi: (email: string, password: string): Promise<TokensResponse | null> =>
    ipcRenderer.invoke(NodeEvents.LoginApi, email, password),
  logoutApi: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.LogoutApi),
  getUserApi: (): Promise<UserResponse | null> => ipcRenderer.invoke(NodeEvents.GetUserApi),
  getTokensApi: (): Promise<TokensResponse | null> => ipcRenderer.invoke(NodeEvents.GetTokensApi),
  refreshTokenApi: (): Promise<string | null> => ipcRenderer.invoke(NodeEvents.RefreshTokenApi),

  // API Calls - Uptime & Rewards
  getUptimeApi: (): Promise<UptimeProgressResponse | null> =>
    ipcRenderer.invoke(NodeEvents.GetUptimeApi),
  getRewardApi: (): Promise<RewardResponse | null> => ipcRenderer.invoke(NodeEvents.GetRewardApi),

  // API Calls - Mining
  getMiningStatsApi: (): Promise<MiningStatsResponse | null> =>
    ipcRenderer.invoke(NodeEvents.GetMiningStatsApi),
  getMiningAssignmentsApi: (params?: {
    platforms?: string[]
    search_query_id?: string
    limit?: number
    offset?: number
    statuses?: string[]
    created_after?: string
  }): Promise<MiningAssignmentsResponse | null> =>
    ipcRenderer.invoke(NodeEvents.GetMiningAssignmentsApi, params),
  getMiningAssignmentDetailApi: (assignmentId: string): Promise<MiningAssignment | null> =>
    ipcRenderer.invoke(NodeEvents.GetMiningAssignmentDetailApi, assignmentId),
  getWorkerPreferencesApi: (): Promise<PreferencesResponse | null> =>
    ipcRenderer.invoke(NodeEvents.GetWorkerPreferencesApi),
  setWorkerPreferencesApi: (preferences: WorkerPreferences): Promise<PreferencesResponse | null> =>
    ipcRenderer.invoke(NodeEvents.SetWorkerPreferencesApi, preferences),

  // Events
  onNodeStatusChanged: (callback: (status: NodeStatus) => void) =>
    createPreloadEventListener(NodeEvents.OnNodeStatusChanged, callback)
}

type NodeIPC = typeof nodeIPC

export { nodeIPC, type NodeIPC }
