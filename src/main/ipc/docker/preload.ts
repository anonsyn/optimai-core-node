import { ipcRenderer } from 'electron'
import { DockerEvents } from './events'
import type { ContainerStatus, DockerInfo } from './types'

export type DockerIPC = typeof dockerIPC

export const dockerIPC = {
  checkInstalled: (): Promise<boolean> => {
    return ipcRenderer.invoke(DockerEvents.CheckInstalled)
  },

  checkRunning: (): Promise<boolean> => {
    return ipcRenderer.invoke(DockerEvents.CheckRunning)
  },

  getInfo: (): Promise<DockerInfo | null> => {
    return ipcRenderer.invoke(DockerEvents.GetInfo)
  },

  checkContainer: (containerName: string): Promise<boolean> => {
    return ipcRenderer.invoke(DockerEvents.CheckContainer, containerName)
  },

  getContainerStatus: (containerName: string): Promise<ContainerStatus | null> => {
    return ipcRenderer.invoke(DockerEvents.GetContainerStatus, containerName)
  },

  getContainerLogs: (containerName: string, lines?: number): Promise<string> => {
    return ipcRenderer.invoke(DockerEvents.GetContainerLogs, containerName, lines)
  },

  listContainers: (all?: boolean): Promise<ContainerStatus[]> => {
    return ipcRenderer.invoke(DockerEvents.ListContainers, all)
  },

  openInstallGuide: (): Promise<boolean> => {
    return ipcRenderer.invoke(DockerEvents.OpenInstallGuide)
  }
}
