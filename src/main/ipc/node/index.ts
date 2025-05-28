import { ipcMain } from 'electron'
import { nodeServer } from '../../node/server'
import { NodeEvents } from './events'

class NodeIpcHandler {
  initialize() {
    ipcMain.handle(NodeEvents.StartNode, async () => {
      return nodeServer.start()
    })
    ipcMain.handle(NodeEvents.StopNode, async () => {
      return nodeServer.stop()
    })
    ipcMain.handle(NodeEvents.GetNodeStatus, async () => {
      return nodeServer.getStatus()
    })
    ipcMain.handle(NodeEvents.GetNodeServerUrl, async () => {
      return nodeServer.getServerUrl()
    })

    nodeServer.on('statusChange', (status) => {
      ipcMain.emit(NodeEvents.OnNodeStatusChanged, status)
    })
  }
}

const nodeIpcHandler = new NodeIpcHandler()

export default nodeIpcHandler
