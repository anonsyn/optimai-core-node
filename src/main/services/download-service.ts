import { app } from 'electron'
import log from 'electron-log/main'
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { getErrorMessage } from '../utils/get-error-message'

export interface DownloadProgress {
  percent: number
  transferred: number
  total: number
  status: 'downloading' | 'completed' | 'error'
}

export interface DockerInstallerInfo {
  url: string
  filename: string
  platform: 'darwin' | 'win32' | 'linux'
}

/**
 * Service for downloading Docker Desktop installer
 */
export class DownloadService {
  private downloadPath: string

  constructor() {
    this.downloadPath = app.getPath('downloads')
  }

  /**
   * Get Docker installer info for current platform
   */
  getDockerInstallerInfo(): DockerInstallerInfo {
    const platform = process.platform as 'darwin' | 'win32' | 'linux'

    switch (platform) {
      case 'darwin': {
        // Check if Apple Silicon or Intel Mac
        const isAppleSilicon = process.arch === 'arm64'
        return {
          url: isAppleSilicon
            ? 'https://desktop.docker.com/mac/main/arm64/Docker.dmg'
            : 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
          filename: 'Docker.dmg',
          platform
        }
      }

      case 'win32':
        return {
          url: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
          filename: 'DockerDesktopInstaller.exe',
          platform
        }

      case 'linux':
        // For Linux, we'll provide instructions instead of direct download
        // as installation varies by distribution
        return {
          url: 'https://docs.docker.com/desktop/install/linux-install/',
          filename: '',
          platform
        }

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Download Docker installer with progress tracking
   */
  async downloadDockerInstaller(
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string | null> {
    try {
      const installerInfo = this.getDockerInstallerInfo()

      // Linux requires different handling
      if (installerInfo.platform === 'linux') {
        log.info('[download] Linux platform - manual installation required')
        return null
      }

      const filePath = path.join(this.downloadPath, installerInfo.filename)

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        log.info(`[download] Docker installer already exists at: ${filePath}`)
        onProgress?.({
          percent: 100,
          transferred: 0,
          total: 0,
          status: 'completed'
        })
        return filePath
      }

      log.info(`[download] Starting Docker installer download from: ${installerInfo.url}`)

      return await this.downloadFile(installerInfo.url, filePath, onProgress)
    } catch (error) {
      log.error(
        '[download] Failed to download Docker installer:',
        getErrorMessage(error, 'Failed to download Docker installer')
      )
      onProgress?.({
        percent: 0,
        transferred: 0,
        total: 0,
        status: 'error'
      })
      return null
    }
  }

  /**
   * Generic file download with progress
   */
  private downloadFile(
    url: string,
    destination: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destination)
      let transferred = 0

      https
        .get(url, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location
            if (redirectUrl) {
              file.close()
              fs.unlinkSync(destination)
              return this.downloadFile(redirectUrl, destination, onProgress)
                .then(resolve)
                .catch(reject)
            }
          }

          if (response.statusCode !== 200) {
            file.close()
            fs.unlinkSync(destination)
            reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
            return
          }

          const total = parseInt(response.headers['content-length'] || '0', 10)

          response.on('data', (chunk: Buffer) => {
            transferred += chunk.length
            const percent = total > 0 ? Math.floor((transferred / total) * 100) : 0

            onProgress?.({
              percent,
              transferred,
              total,
              status: 'downloading'
            })
          })

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            log.info(`[download] Download completed: ${destination}`)

            onProgress?.({
              percent: 100,
              transferred: total,
              total,
              status: 'completed'
            })

            resolve(destination)
          })

          file.on('error', (error) => {
            fs.unlinkSync(destination)
            reject(error)
          })
        })
        .on('error', (error) => {
          file.close()
          fs.unlinkSync(destination)
          reject(error)
        })
    })
  }

  /**
   * Get the path to the downloaded Docker installer
   */
  getDockerInstallerPath(): string | null {
    try {
      const installerInfo = this.getDockerInstallerInfo()

      if (installerInfo.platform === 'linux') {
        return null
      }

      const filePath = path.join(this.downloadPath, installerInfo.filename)

      if (fs.existsSync(filePath)) {
        return filePath
      }

      return null
    } catch (error) {
      log.error(
        '[download] Failed to get Docker installer path:',
        getErrorMessage(error, 'Failed to get Docker installer path')
      )
      return null
    }
  }

  /**
   * Remove downloaded Docker installer
   */
  cleanupDockerInstaller(): boolean {
    try {
      const installerPath = this.getDockerInstallerPath()

      if (installerPath && fs.existsSync(installerPath)) {
        fs.unlinkSync(installerPath)
        log.info(`[download] Cleaned up Docker installer: ${installerPath}`)
        return true
      }

      return false
    } catch (error) {
      log.error(
        '[download] Failed to cleanup Docker installer:',
        getErrorMessage(error, 'Failed to cleanup Docker installer')
      )
      return false
    }
  }
}

// Export singleton instance
export const downloadService = new DownloadService()
