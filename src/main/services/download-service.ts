import { app } from 'electron'
import log from '../configs/logger'
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

  private getInstallerFilePaths(filename: string) {
    const finalPath = path.join(this.downloadPath, filename)

    return {
      finalPath,
      tempPath: `${finalPath}.partial`,
      markerPath: `${finalPath}.complete`
    }
  }

  private removeFileQuietly(target: string) {
    try {
      if (fs.existsSync(target)) {
        fs.unlinkSync(target)
      }
    } catch (error) {
      log.warn(
        `[download] Failed to remove file ${target}:`,
        getErrorMessage(error, 'Failed to remove file during cleanup')
      )
    }
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

      const { finalPath, tempPath, markerPath } = this.getInstallerFilePaths(installerInfo.filename)

      if (fs.existsSync(finalPath) && fs.existsSync(markerPath)) {
        log.info(`[download] Docker installer already exists at: ${finalPath}`)
        try {
          const stats = fs.statSync(finalPath)
          onProgress?.({
            percent: 100,
            transferred: stats.size,
            total: stats.size,
            status: 'completed'
          })
        } catch (error) {
          log.warn(
            '[download] Failed to stat existing Docker installer:',
            getErrorMessage(error, 'Failed to stat existing Docker installer')
          )
          onProgress?.({
            percent: 100,
            transferred: 0,
            total: 0,
            status: 'completed'
          })
        }
        return finalPath
      }

      if (fs.existsSync(finalPath) && !fs.existsSync(markerPath)) {
        log.warn(
          `[download] Found Docker installer without completion marker, cleaning up: ${finalPath}`
        )
        this.removeFileQuietly(finalPath)
      }

      if (fs.existsSync(markerPath) && !fs.existsSync(finalPath)) {
        log.warn(`[download] Found completion marker without installer, cleaning up: ${markerPath}`)
        this.removeFileQuietly(markerPath)
      }

      if (fs.existsSync(tempPath)) {
        log.warn(`[download] Removing stale partial download: ${tempPath}`)
        this.removeFileQuietly(tempPath)
      }

      log.info(`[download] Starting Docker installer download from: ${installerInfo.url}`)

      const downloadedPath = await this.downloadFile(installerInfo.url, tempPath, onProgress)

      try {
        if (!fs.existsSync(downloadedPath)) {
          throw new Error(`Missing downloaded file at ${downloadedPath}`)
        }

        fs.renameSync(downloadedPath, finalPath)
      } catch (error) {
        this.removeFileQuietly(downloadedPath)
        log.error(
          '[download] Failed to finalize Docker installer:',
          getErrorMessage(error, 'Failed to move downloaded installer into place')
        )
        throw error
      }

      try {
        const stats = fs.statSync(finalPath)
        const markerPayload = {
          downloadedAt: new Date().toISOString(),
          size: stats.size
        }
        fs.writeFileSync(markerPath, JSON.stringify(markerPayload))
      } catch (error) {
        log.warn(
          '[download] Failed to write completion marker:',
          getErrorMessage(error, 'Failed to write completion marker')
        )
      }

      return finalPath
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
              this.removeFileQuietly(destination)
              return this.downloadFile(redirectUrl, destination, onProgress)
                .then(resolve)
                .catch(reject)
            }
          }

          if (response.statusCode !== 200) {
            file.close()
            this.removeFileQuietly(destination)
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
            this.removeFileQuietly(destination)
            reject(error)
          })
        })
        .on('error', (error) => {
          file.close()
          this.removeFileQuietly(destination)
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

      const { finalPath, markerPath } = this.getInstallerFilePaths(installerInfo.filename)

      if (fs.existsSync(finalPath) && fs.existsSync(markerPath)) {
        return finalPath
      }

      if (fs.existsSync(finalPath) && !fs.existsSync(markerPath)) {
        log.warn(
          `[download] Found Docker installer without completion marker, cleaning up: ${finalPath}`
        )
        this.removeFileQuietly(finalPath)
      }

      if (fs.existsSync(markerPath) && !fs.existsSync(finalPath)) {
        this.removeFileQuietly(markerPath)
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
      const installerInfo = this.getDockerInstallerInfo()

      if (installerInfo.platform === 'linux') {
        return false
      }

      const { finalPath, tempPath, markerPath } = this.getInstallerFilePaths(installerInfo.filename)

      let removed = false

      if (fs.existsSync(finalPath)) {
        this.removeFileQuietly(finalPath)
        removed = true
      }

      if (fs.existsSync(tempPath)) {
        this.removeFileQuietly(tempPath)
        removed = true
      }

      if (fs.existsSync(markerPath)) {
        this.removeFileQuietly(markerPath)
        removed = true
      }

      if (removed) {
        log.info('[download] Cleaned up Docker installer artifacts')
      }

      return removed
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
