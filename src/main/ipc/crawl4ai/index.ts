import { ipcMain, shell } from 'electron'
import log from 'electron-log/main'
import { crawl4AiService } from '../../services/crawl4ai-service'
import { dockerService } from '../../services/docker-service'
import { getErrorMessage } from '../../utils/get-error-message'
import windowManager from '../../window/manager'
import { Crawl4AiEvents } from './events'
import type { Crawl4AiStatus, InitProgress, ServiceInfo } from './types'
class Crawl4AiIpcHandler {
  initialize() {
    // Check Crawl4AI service availability
    ipcMain.handle(Crawl4AiEvents.CheckAvailability, async (): Promise<Crawl4AiStatus> => {
      try {
        const dockerInstalled = await dockerService.isInstalled()
        const dockerRunning = dockerInstalled ? await dockerService.isRunning() : false
        const initialized = crawl4AiService.isInitialized()
        const healthy = initialized ? await crawl4AiService.checkHealth() : false
        const port = crawl4AiService.getPort()

        return {
          dockerInstalled,
          dockerRunning,
          initialized,
          healthy,
          port: port || undefined
        }
      } catch (error) {
        log.error(
          'Crawl4AI availability check failed:',
          getErrorMessage(error, 'Crawl4AI availability check failed')
        )
        return {
          dockerInstalled: false,
          dockerRunning: false,
          initialized: false,
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    // Check Docker status only
    ipcMain.handle(
      Crawl4AiEvents.CheckDockerStatus,
      async (): Promise<{ installed: boolean; running: boolean }> => {
        try {
          const installed = await dockerService.isInstalled()
          const running = installed ? await dockerService.isRunning() : false
          return { installed, running }
        } catch (error) {
          log.error(
            'Docker status check failed:',
            getErrorMessage(error, 'Docker status check failed')
          )
          return { installed: false, running: false }
        }
      }
    )

    // Initialize Crawl4AI service
    ipcMain.handle(Crawl4AiEvents.Initialize, async (): Promise<boolean> => {
      try {
        // Send initial progress
        this.broadcast(Crawl4AiEvents.OnInitProgress, {
          status: 'checking',
          message: 'Checking Docker availability...'
        } as InitProgress)

        // Check Docker first
        const dockerInstalled = await dockerService.isInstalled()
        if (!dockerInstalled) {
          this.broadcast(Crawl4AiEvents.OnInitProgress, {
            status: 'error',
            error: 'Docker is not installed'
          } as InitProgress)
          return false
        }

        const dockerRunning = await dockerService.isRunning()
        if (!dockerRunning) {
          this.broadcast(Crawl4AiEvents.OnInitProgress, {
            status: 'error',
            error: 'Docker daemon is not running'
          } as InitProgress)
          return false
        }

        // Initialize the service (will pull image if needed, start container, etc)
        this.broadcast(Crawl4AiEvents.OnInitProgress, {
          status: 'pulling',
          message: 'Preparing Crawl4AI container...'
        } as InitProgress)

        const success = await crawl4AiService.initialize()

        // Send completion status
        this.broadcast(Crawl4AiEvents.OnInitProgress, {
          status: success ? 'ready' : 'error',
          message: success ? 'Crawl4AI service is ready' : 'Failed to initialize service',
          error: success ? undefined : 'Initialization failed'
        } as InitProgress)

        // Also broadcast status change
        if (success) {
          this.broadcast(Crawl4AiEvents.OnStatusChange, {
            initialized: true,
            baseUrl: crawl4AiService.getBaseUrl(),
            port: crawl4AiService.getPort(),
            containerName: 'optimai_crawl4ai',
            imageName: 'unclecode/crawl4ai:basic'
          } as ServiceInfo)
        }

        return success
      } catch (error) {
        log.error(
          'Crawl4AI initialization failed:',
          getErrorMessage(error, 'Crawl4AI initialization failed')
        )

        this.broadcast(Crawl4AiEvents.OnInitProgress, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } as InitProgress)

        return false
      }
    })

    // Check if service is healthy
    ipcMain.handle(Crawl4AiEvents.CheckHealth, async (): Promise<boolean> => {
      try {
        return await crawl4AiService.checkHealth()
      } catch (error) {
        log.error('Health check failed:', getErrorMessage(error, 'Health check failed'))
        return false
      }
    })

    // Stop Crawl4AI service
    ipcMain.handle(Crawl4AiEvents.Stop, async (): Promise<boolean> => {
      try {
        const success = await crawl4AiService.stop()

        // Broadcast status change
        this.broadcast(Crawl4AiEvents.OnStatusChange, {
          initialized: false,
          containerName: 'optimai_crawl4ai',
          imageName: 'unclecode/crawl4ai:basic'
        } as ServiceInfo)

        return success
      } catch (error) {
        log.error('Failed to stop Crawl4AI:', getErrorMessage(error, 'Failed to stop Crawl4AI'))
        return false
      }
    })

    // Get service logs
    ipcMain.handle(Crawl4AiEvents.GetLogs, async (_event, lines: number = 50): Promise<string> => {
      try {
        return await crawl4AiService.getLogs(lines)
      } catch (error) {
        log.error(
          'Failed to get Crawl4AI logs:',
          getErrorMessage(error, 'Failed to get Crawl4AI logs')
        )
        return ''
      }
    })

    // Open Docker installation guide
    ipcMain.handle(Crawl4AiEvents.OpenDockerGuide, async () => {
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

  private broadcast(channel: string, ...args: unknown[]) {
    windowManager.getAllWindows().forEach((window) => {
      window.webContents.send(channel, ...args)
    })
  }
}

const crawl4AiIpcHandler = new Crawl4AiIpcHandler()

export default crawl4AiIpcHandler
