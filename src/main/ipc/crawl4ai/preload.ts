import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Crawl4AiEvents } from './events'
import type { Crawl4AiStatus, InitProgress, ServiceInfo } from './types'

export type Crawl4AiIPC = typeof crawl4AiIPC

export const crawl4AiIPC = {
  checkAvailability: (): Promise<Crawl4AiStatus> => {
    return ipcRenderer.invoke(Crawl4AiEvents.CheckAvailability)
  },

  checkDockerStatus: (): Promise<{ installed: boolean; running: boolean }> => {
    return ipcRenderer.invoke(Crawl4AiEvents.CheckDockerStatus)
  },

  initialize: (): Promise<boolean> => {
    return ipcRenderer.invoke(Crawl4AiEvents.Initialize)
  },

  checkHealth: (): Promise<boolean> => {
    return ipcRenderer.invoke(Crawl4AiEvents.CheckHealth)
  },

  stop: (): Promise<boolean> => {
    return ipcRenderer.invoke(Crawl4AiEvents.Stop)
  },

  getLogs: (lines?: number): Promise<string> => {
    return ipcRenderer.invoke(Crawl4AiEvents.GetLogs, lines)
  },

  openDockerGuide: (): Promise<boolean> => {
    return ipcRenderer.invoke(Crawl4AiEvents.OpenDockerGuide)
  },

  // Event listeners
  onInitProgress: (callback: (progress: InitProgress) => void) => {
    const listener = (_event: IpcRendererEvent, progress: InitProgress) => {
      callback(progress)
    }
    ipcRenderer.on(Crawl4AiEvents.OnInitProgress, listener)

    return () => {
      ipcRenderer.removeListener(Crawl4AiEvents.OnInitProgress, listener)
    }
  },

  onStatusChange: (callback: (info: ServiceInfo) => void) => {
    const listener = (_event: IpcRendererEvent, info: ServiceInfo) => {
      callback(info)
    }
    ipcRenderer.on(Crawl4AiEvents.OnStatusChange, listener)

    return () => {
      ipcRenderer.removeListener(Crawl4AiEvents.OnStatusChange, listener)
    }
  }
}
