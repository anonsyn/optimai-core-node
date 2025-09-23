import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'

import { nodeRuntime, NodeRuntimeEvent } from '../../node/node-runtime'
import { getErrorMessage } from '../../utils/get-error-message'
import { NodeEvents } from './events'

class NodeIpcHandler {
  constructor() {
    nodeRuntime.on(NodeRuntimeEvent.Status, (status) => {
      this.broadcast(NodeEvents.OnNodeStatusChanged, status)
    })

    nodeRuntime.on(NodeRuntimeEvent.UptimeReward, (reward) => {
      this.broadcast(NodeEvents.OnUptimeReward, reward)
    })

    nodeRuntime.on(NodeRuntimeEvent.UptimeCycle, (cycle) => {
      this.broadcast(NodeEvents.OnUptimeCycle, cycle)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningAssignment, (assignment) => {
      this.broadcast(NodeEvents.OnMiningAssignment, assignment)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningAssignmentCompleted, (assignmentId) => {
      this.broadcast(NodeEvents.OnMiningAssignmentCompleted, assignmentId)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningError, (error) => {
      const message = getErrorMessage(error, 'Mining worker error')
      log.error('Mining worker error:', message)
      this.broadcast(NodeEvents.OnMiningError, {
        message
      })
    })

    nodeRuntime.on(NodeRuntimeEvent.Error, (error) => {
      const message = getErrorMessage(error, 'Node runtime error')
      log.error('Node runtime error:', message)
      this.broadcast(NodeEvents.OnNodeError, {
        message
      })
    })
  }

  initialize() {
    ipcMain.handle(NodeEvents.StartNode, async () => {
      return nodeRuntime.start()
    })

    ipcMain.handle(NodeEvents.StopNode, async () => {
      return nodeRuntime.stop()
    })

    ipcMain.handle(NodeEvents.GetStatus, async () => {
      return nodeRuntime.getStatus()
    })

    ipcMain.handle(NodeEvents.CompleteMiningAssignment, async () => {
      throw new Error('Complete assignment functionality has been removed')
    })
  }

  async cleanup() {
    await nodeRuntime.stop()
  }

  private broadcast(channel: string, ...args: unknown[]) {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(channel, ...args)
    })
  }
}

const nodeIpcHandler = new NodeIpcHandler()

export default nodeIpcHandler
