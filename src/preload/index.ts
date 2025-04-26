import { windowIPC } from '@main/ipc/window/preload'
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('windowIPC', windowIPC)
