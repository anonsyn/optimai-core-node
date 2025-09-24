import { ipcRenderer } from 'electron'

import type { NodeStatusResponse } from '../../node/types'
import type { SubmitAssignmentRequest } from '../../api/mining/type'
import type { MiningAssignment } from '../../node/types'
import type { MiningWorkerStatus } from '../../node/mining-worker'
import type { UptimeData } from '../../storage'
import { createPreloadEventListener } from '../../utils/ipc'
import { NodeEvents } from './events'

const nodeIPC = {
  startNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StartNode),
  stopNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StopNode),
  getStatus: (): Promise<NodeStatusResponse> => ipcRenderer.invoke(NodeEvents.GetStatus),
  getMiningStatus: (): Promise<MiningWorkerStatus> =>
    ipcRenderer.invoke(NodeEvents.GetMiningStatus),
  completeMiningAssignment: (
    assignmentId: string,
    payload: SubmitAssignmentRequest
  ): Promise<void> =>
    ipcRenderer.invoke(NodeEvents.CompleteMiningAssignment, assignmentId, payload),

  onStatusChanged: (callback: (status: NodeStatusResponse) => void) =>
    createPreloadEventListener(NodeEvents.OnNodeStatusChanged, callback),
  onUptimeReward: (callback: (reward: { amount: string; timestamp: number }) => void) =>
    createPreloadEventListener(NodeEvents.OnUptimeReward, callback),
  onUptimeCycle: (callback: (cycle: UptimeData) => void) =>
    createPreloadEventListener(NodeEvents.OnUptimeCycle, callback),
  onMiningAssignments: (callback: (assignments: MiningAssignment[]) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningAssignments, callback),
  onMiningAssignmentStarted: (callback: (assignmentId: string) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningAssignmentStarted, callback),
  onMiningAssignmentCompleted: (callback: (assignmentId: string) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningAssignmentCompleted, callback),
  onMiningStatusChanged: (callback: (status: MiningWorkerStatus) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningStatusChanged, callback),
  onNodeError: (callback: (payload: { message: string }) => void) =>
    createPreloadEventListener(NodeEvents.OnNodeError, callback),
  onMiningError: (callback: (payload: { message: string }) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningError, callback)
}

type NodeIPC = typeof nodeIPC

export { nodeIPC, type NodeIPC }
