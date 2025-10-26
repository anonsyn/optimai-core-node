import { type AuthIPC } from '../main/ipc/auth/preload'
import { type Crawl4AiIPC } from '../main/ipc/crawl4ai/preload'
import { type DockerIPC } from '../main/ipc/docker/preload'
import { type NodeIPC } from '../main/ipc/node/preload'
import { type ReportsIPC } from '../main/ipc/reports/preload'
import { type UpdaterIPC } from '../main/ipc/updater/preload'
import { type WindowIPC } from '../main/ipc/window/preload'

declare global {
  interface Window {
    windowIPC: WindowIPC
    updaterIPC: UpdaterIPC
    authIPC: AuthIPC
    nodeIPC: NodeIPC
    dockerIPC: DockerIPC
    crawl4AiIPC: Crawl4AiIPC
    reportsIPC: ReportsIPC
  }
}
