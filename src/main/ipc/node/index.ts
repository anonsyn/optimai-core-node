import { ipcMain } from 'electron'
import log from 'electron-log/main'

import { nodeRuntime, NodeRuntimeEvent } from '../../node/node-runtime'
import { getFullDeviceInfo } from '../../utils/device-info'
import { getErrorMessage } from '../../utils/get-error-message'
import windowManager from '../../window/manager'
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

    nodeRuntime.on(NodeRuntimeEvent.MiningAssignments, (assignments) => {
      console.log('NEW MINING ASSIGNMENTS')
      this.broadcast(NodeEvents.OnMiningAssignments, assignments)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningAssignmentStarted, (assignmentId) => {
      this.broadcast(NodeEvents.OnMiningAssignmentStarted, assignmentId)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningAssignmentCompleted, (assignmentId) => {
      this.broadcast(NodeEvents.OnMiningAssignmentCompleted, assignmentId)
    })

    nodeRuntime.on(NodeRuntimeEvent.MiningStatusChanged, (status) => {
      this.broadcast(NodeEvents.OnMiningStatusChanged, status)
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

    ipcMain.handle(NodeEvents.RestartMining, async () => {
      return nodeRuntime.restartMining()
    })

    ipcMain.handle(NodeEvents.GetStatus, async () => {
      return nodeRuntime.getStatus()
    })

    ipcMain.handle(NodeEvents.GetMiningStatus, async () => {
      return nodeRuntime.getMiningStatus()
    })

    ipcMain.handle(NodeEvents.GetDeviceInfo, async () => {
      return getFullDeviceInfo()
    })

    ipcMain.handle(NodeEvents.CompleteMiningAssignment, async () => {
      throw new Error('Complete assignment functionality has been removed')
    })
  }

  async cleanup() {
    await nodeRuntime.stop()
  }

  private broadcast(channel: string, ...args: unknown[]) {
    windowManager.getAllWindows().forEach((window) => {
      window.webContents.send(channel, ...args)
    })
  }
}

const nodeIpcHandler = new NodeIpcHandler()

export default nodeIpcHandler
