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
  }
}

const nodeIpcHandler = new NodeIpcHandler()

export default nodeIpcHandler
