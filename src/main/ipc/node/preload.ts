import { ipcRenderer } from 'electron'
import { NodeStatus } from '../../node/types'
import { createPreloadEventListener } from '../../utils/ipc'
import { NodeEvents } from './events'

const nodeIPC = {
  startNode: () => ipcRenderer.invoke(NodeEvents.StartNode),
  stopNode: () => ipcRenderer.invoke(NodeEvents.StopNode),
  getNodeStatus: () => ipcRenderer.invoke(NodeEvents.GetNodeStatus),
  getNodeServerUrl: () => ipcRenderer.invoke(NodeEvents.GetNodeServerUrl),
  getPort: () => ipcRenderer.invoke(NodeEvents.GetPort),
  onNodeStatusChanged: (callback: (status: NodeStatus) => void) =>
    createPreloadEventListener(NodeEvents.OnNodeStatusChanged, callback)
}

type NodeIPC = typeof nodeIPC

export { nodeIPC, type NodeIPC }
