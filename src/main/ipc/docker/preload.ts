import { ipcRenderer } from 'electron'
import { DockerEvents } from './events'
import type { ContainerStatus, DockerInfo } from './types'

export interface DownloadProgress {
  percent: number
  transferred: number
  total: number
  status: 'downloading' | 'completed' | 'error'
}

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
  },

  downloadInstaller: (): Promise<string | null> => {
    return ipcRenderer.invoke(DockerEvents.DownloadInstaller)
  },

  openInstaller: (): Promise<boolean> => {
    return ipcRenderer.invoke(DockerEvents.OpenInstaller)
  },

  getInstallerPath: (): Promise<string | null> => {
    return ipcRenderer.invoke(DockerEvents.GetInstallerPath)
  },

  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: DownloadProgress) => {
      callback(progress)
    }
    ipcRenderer.on(DockerEvents.OnDownloadProgress, handler)
    return () => {
      ipcRenderer.off(DockerEvents.OnDownloadProgress, handler)
    }
  }
}
