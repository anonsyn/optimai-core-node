import { ipcRenderer } from 'electron'
import { NodeEvents } from './events'

const nodeIPC = {
  startNode: () => ipcRenderer.invoke(NodeEvents.StartNode),
  stopNode: () => ipcRenderer.invoke(NodeEvents.StopNode)
}

type NodeIPC = typeof nodeIPC

export { nodeIPC, type NodeIPC }
