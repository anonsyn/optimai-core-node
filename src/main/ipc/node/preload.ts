import { ipcRenderer } from 'electron'

import type { SubmitAssignmentRequest } from '../../api/mining/types'
import type { AppError } from '../../errors/error-codes'
import type { LocalDeviceInfo, MiningAssignment, MiningWorkerStatus } from '../../node/types'
import type { UptimeData } from '../../storage'
import { createPreloadEventListener } from '../../utils/ipc'
import { NodeEvents } from './events'

const nodeIPC = {
  startNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StartNode),
  stopNode: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.StopNode),
  restartMining: (): Promise<boolean> => ipcRenderer.invoke(NodeEvents.RestartMining),
  getMiningStatus: (): Promise<MiningWorkerStatus> =>
    ipcRenderer.invoke(NodeEvents.GetMiningStatus),
  getLocalDeviceInfo: (): Promise<LocalDeviceInfo> =>
    ipcRenderer.invoke(NodeEvents.GetLocalDeviceInfo),
  completeMiningAssignment: (
    assignmentId: string,
    payload: SubmitAssignmentRequest
  ): Promise<void> =>
    ipcRenderer.invoke(NodeEvents.CompleteMiningAssignment, assignmentId, payload),

  onDeviceIdChanged: (callback: (deviceId: string) => void) =>
    createPreloadEventListener(NodeEvents.OnDeviceIdChanged, callback),
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
  onMiningError: (callback: (error: AppError) => void) =>
    createPreloadEventListener(NodeEvents.OnMiningError, callback)
}

type NodeIPC = typeof nodeIPC

export { nodeIPC, type NodeIPC }
