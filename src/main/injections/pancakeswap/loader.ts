import * as chokidar from 'chokidar'
import { EventEmitter } from 'eventemitter3'
import { promises as fs } from 'fs'
import { PANCAKESWAP_INJECTION_SCRIPT_PATH } from '../../configs/injection-paths'
import { getErrorMessage } from '../../utils/get-error-message'

export interface PancakeSwapInjectionLoaderEvents {
  change: () => void
}

export class PancakeSwapInjectionLoader extends EventEmitter<PancakeSwapInjectionLoaderEvents> {
  private _content: string | null = null
  private _watcher: chokidar.FSWatcher | null = null

  constructor() {
    super()
  }

  /**
   * Get the content of the PancakeSwap injection script
   */
  async getContent(forceRead = false): Promise<string> {
    try {
      // Return cached content if available
      if (this._content !== null && !forceRead) {
        return this._content
      }

      // Read from file if no cache
      const content = await fs.readFile(PANCAKESWAP_INJECTION_SCRIPT_PATH, 'utf8')
      this._content = content
      return content
    } catch (error) {
      throw new Error(`Failed to read PancakeSwap injection script: ${error}`)
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
      this._watcher = chokidar.watch(PANCAKESWAP_INJECTION_SCRIPT_PATH, {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50
        }
      })

      this._watcher.on('change', async () => {
        console.log('[PancakeSwapLoader] File change detected')
        try {
          // Force re-read the file
          await this.getContent(true)
          console.log('[PancakeSwapLoader] File reloaded, emitting change event')
          this.emit('change')
        } catch (error) {
          console.error(
            '[PancakeSwapLoader] Error reading injection script after change:',
            getErrorMessage(error, 'PancakeSwap loader file reload failed')
          )
        }
      })

      this._watcher.on('error', (error) => {
        console.error(
          '[PancakeSwapLoader] Watcher error:',
          getErrorMessage(error, 'PancakeSwap loader watcher error')
        )
      })

      console.log('[PancakeSwapLoader] Started watching:', PANCAKESWAP_INJECTION_SCRIPT_PATH)
    } catch (error) {
      console.error(
        'Error setting up file watcher:',
        getErrorMessage(error, 'Failed to set up PancakeSwap file watcher')
      )
    }
  }

  /**
   * Stop watching for changes
   */
  async stopWatching(): Promise<void> {
    if (this._watcher) {
      await this._watcher.close()
      this._watcher = null
      console.log('[PancakeSwapLoader] Stopped watching')
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
export const pancakeSwapInjectionLoader = new PancakeSwapInjectionLoader()
