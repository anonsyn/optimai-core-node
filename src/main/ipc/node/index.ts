import { BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'

import type { SubmitAssignmentRequest } from '../../api/mining/type'
import { nodeRuntime, NodeRuntimeEvent } from '../../node/node-runtime'
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
      log.error('Mining worker error:', error)
      this.broadcast(NodeEvents.OnMiningError, {
        message: error.message
      })
    })

    nodeRuntime.on(NodeRuntimeEvent.Error, (error) => {
      log.error('Node runtime error:', error)
      this.broadcast(NodeEvents.OnNodeError, {
        message: error.message
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

    ipcMain.handle(
      NodeEvents.CompleteMiningAssignment,
      async (_event, assignmentId: string, payload: SubmitAssignmentRequest) => {
        return nodeRuntime.completeMiningAssignment(assignmentId, payload)
      }
    )
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
