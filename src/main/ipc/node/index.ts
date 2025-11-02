import { ipcMain } from 'electron'
import log from '../../configs/logger'

import { deviceApi, DeviceDetail } from '../../api/device'
import { nodeRuntime, NodeRuntimeEvent } from '../../node/node-runtime'
import type { LocalDeviceInfo } from '../../node/types'
import { deviceStore } from '../../storage/device-store'
import { getFullDeviceInfo } from '../../utils/device-info'
import { getErrorMessage } from '../../utils/get-error-message'
import { getIpGeolocation } from '../../utils/ip-geolocation'
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

    // Watch device store for changes and broadcast device ID
    deviceStore.onDidChange(() => {
      const deviceId = deviceStore.getDeviceId()
      if (deviceId) {
        log.info('[ipc] Device ID changed, broadcasting to renderer:', deviceId)
        this.broadcast(NodeEvents.OnDeviceIdChanged, deviceId)
      }
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

    ipcMain.handle(NodeEvents.GetLocalDeviceInfo, async () => {
      try {
        // Get device info and IP geolocation in parallel
        const [deviceInfoResult, ipGeoResult] = await Promise.all([
          getFullDeviceInfo(),
          getIpGeolocation()
        ])

        const deviceInfo = deviceInfoResult.deviceInfo
        const deviceId = deviceStore.getDeviceId()

        let deviceDetail: Partial<DeviceDetail> = {}

        if (deviceId) {
          try {
            log.info('[ipc] Getting device detail for device ID:', deviceId)
            const res = await deviceApi.getDeviceById(deviceId)
            deviceDetail = res.data.detail
          } catch (error) {
            log.error('[ipc] Failed to get device detail:', getErrorMessage(error))
          }
        }

        const localDeviceInfo: LocalDeviceInfo = {
          device_id: deviceId,
          ip_address: deviceDetail.ip_address || ipGeoResult.ip_address || '--',
          country: deviceDetail.country || ipGeoResult.country || '--',
          country_code: deviceDetail.country_code2 || ipGeoResult.country_code || '--',
          cpu_cores: deviceInfo.cpu_cores || 0,
          memory_gb: deviceInfo.memory_gb || 0,
          os_name: deviceInfo.os_name || '--',
          os_version: deviceInfo.os_version || '--',
          latitude: deviceDetail.latitude ?? ipGeoResult.latitude,
          longitude: deviceDetail.longitude ?? ipGeoResult.longitude
        }

        return localDeviceInfo
      } catch (error) {
        log.error('[ipc] Failed to get local device info:', getErrorMessage(error))
        throw error
      }
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
