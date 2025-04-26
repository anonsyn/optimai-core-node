import { type WindowIPC } from '../main/ipc/window/preload'

declare global {
  interface Window {
    windowIPC: WindowIPC
  }
}
