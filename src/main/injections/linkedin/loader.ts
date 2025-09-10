import * as chokidar from 'chokidar'
import { EventEmitter } from 'eventemitter3'
import { promises as fs } from 'fs'
import { LINKEDIN_INJECTION_SCRIPT_PATH } from '../../configs/injection-paths'

export interface LinkedInInjectionLoaderEvents {
  change: () => void
}

export class LinkedInInjectionLoader extends EventEmitter<LinkedInInjectionLoaderEvents> {
  private _content: string | null = null
  private _watcher: chokidar.FSWatcher | null = null

  constructor() {
    super()
  }

  /**
   * Get the content of the LinkedIn injection script
   */
  async getContent(forceRead = false): Promise<string> {
    try {
      // Return cached content if available
      if (this._content !== null && !forceRead) {
        return this._content
      }

      // Read from file if no cache
      const content = await fs.readFile(LINKEDIN_INJECTION_SCRIPT_PATH, 'utf8')
      this._content = content
      return content
    } catch (error) {
      throw new Error(`Failed to read LinkedIn injection script: ${error}`)
    }
  }

  /**
   * Start watching for changes to the injection script
   */
  async startWatching(): Promise<void> {
    if (this._watcher) return

    // Initial load
    await this.getContent()

    try {
      // Use chokidar to watch the specific file
      this._watcher = chokidar.watch(LINKEDIN_INJECTION_SCRIPT_PATH, {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50
        }
      })

      this._watcher.on('change', async () => {
        console.log('[LinkedInLoader] File change detected')
        try {
          // Force re-read the file
          await this.getContent(true)
          console.log('[LinkedInLoader] File reloaded, emitting change event')
          this.emit('change')
        } catch (error) {
          console.error('[LinkedInLoader] Error reading injection script after change:', error)
        }
      })

      this._watcher.on('error', (error) => {
        console.error('[LinkedInLoader] Watcher error:', error)
      })

      console.log('[LinkedInLoader] Started watching:', LINKEDIN_INJECTION_SCRIPT_PATH)
    } catch (error) {
      console.error('Error setting up file watcher:', error)
    }
  }

  /**
   * Stop watching for changes
   */
  async stopWatching(): Promise<void> {
    if (this._watcher) {
      await this._watcher.close()
      this._watcher = null
      console.log('[LinkedInLoader] Stopped watching')
    }
  }

  /**
   * Get the cached content without reading from file
   */
  getCachedContent(): string | null {
    return this._content
  }
}

// Export singleton instance
export const linkedInInjectionLoader = new LinkedInInjectionLoader()
