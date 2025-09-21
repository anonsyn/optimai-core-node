import { ipcMain, shell } from 'electron'
import log from 'electron-log/main'
import { dockerService } from '../../services/docker-service'
import { DockerEvents } from './events'
import type { ContainerStatus, DockerInfo } from './types'

/**
 * Generic Docker IPC handler for Docker-related operations
 */
class DockerIpcHandler {
  initialize() {
    // Check if Docker is installed
    ipcMain.handle(DockerEvents.CheckInstalled, async (): Promise<boolean> => {
      try {
        return await dockerService.isInstalled()
      } catch (error) {
        log.error('Docker installation check failed:', error)
        return false
      }
    })

    // Check if Docker daemon is running
    ipcMain.handle(DockerEvents.CheckRunning, async (): Promise<boolean> => {
      try {
        return await dockerService.isRunning()
      } catch (error) {
        log.error('Docker running check failed:', error)
        return false
      }
    })

    // Get Docker information
    ipcMain.handle(DockerEvents.GetInfo, async (): Promise<DockerInfo | null> => {
      try {
        return await dockerService.getInfo()
      } catch (error) {
        log.error('Failed to get Docker info:', error)
        return null
      }
    })

    // Check if a specific container is running
    ipcMain.handle(
      DockerEvents.CheckContainer,
      async (_event, containerName: string): Promise<boolean> => {
        try {
          return await dockerService.isContainerRunning(containerName)
        } catch (error) {
          log.error(`Container check failed for ${containerName}:`, error)
          return false
        }
      }
    )

    // Get container status
    ipcMain.handle(
      DockerEvents.GetContainerStatus,
      async (_event, containerName: string): Promise<ContainerStatus | null> => {
        try {
          return await dockerService.getContainerStatus(containerName)
        } catch (error) {
          log.error(`Failed to get status for container ${containerName}:`, error)
          return null
        }
      }
    )

    // Get container logs
    ipcMain.handle(
      DockerEvents.GetContainerLogs,
      async (_event, containerName: string, lines: number = 50): Promise<string> => {
        try {
          return await dockerService.getLogs(containerName, { tail: lines })
        } catch (error) {
          log.error(`Failed to get logs for container ${containerName}:`, error)
          return ''
        }
      }
    )

    // List all containers
    ipcMain.handle(
      DockerEvents.ListContainers,
      async (_event, all: boolean = false): Promise<ContainerStatus[]> => {
        try {
          return await dockerService.listContainers(all)
        } catch (error) {
          log.error('Failed to list containers:', error)
          return []
        }
      }
    )

    // Open Docker installation guide
    ipcMain.handle(DockerEvents.OpenInstallGuide, async () => {
      const platform = process.platform
      let url = 'https://docs.docker.com/get-docker/'

      if (platform === 'darwin') {
        url = 'https://docs.docker.com/desktop/install/mac-install/'
      } else if (platform === 'win32') {
        url = 'https://docs.docker.com/desktop/install/windows-install/'
      } else if (platform === 'linux') {
        url = 'https://docs.docker.com/desktop/install/linux-install/'
      }

      await shell.openExternal(url)
      return true
    })
  }
}

const dockerIpcHandler = new DockerIpcHandler()

export default dockerIpcHandler