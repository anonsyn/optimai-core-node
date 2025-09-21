import log from 'electron-log/main'
import { dockerManager } from './docker-manager'

export interface CrawlOptions {
  url: string
  sessionId?: string
  useLightMode?: boolean
  useTextMode?: boolean
  cacheMode?: 'smart' | 'bypass' | 'force' | 'write_only' | 'read_only'
  persistentContext?: boolean
  userDataDir?: string
}

export interface CrawlResult {
  url: string
  markdown?: string
  content?: string
  html?: string
  metadata: {
    title?: string
    description?: string
    keywords?: string
    author?: string
    language?: string
    [key: string]: any
  }
  status_code: number
  error?: string
}

class CrawlerService {
  private baseUrl: string
  private initialized: boolean = false
  private initializationPromise: Promise<boolean> | null = null

  constructor(port: number = 8080) {
    this.baseUrl = `http://localhost:${port}`
  }

  /**
   * Initialize the crawler service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      return await this.initializationPromise
    }

    // Start initialization
    this.initializationPromise = this._doInitialize()
    const result = await this.initializationPromise
    this.initializationPromise = null

    return result
  }

  private async _doInitialize(): Promise<boolean> {
    try {
      log.info('[crawler] Initializing crawler service...')

      // Initialize Docker environment
      const dockerReady = await dockerManager.initialize()
      if (!dockerReady) {
        log.error('[crawler] Failed to initialize Docker environment')
        return false
      }

      this.initialized = true
      log.info('[crawler] Crawler service initialized successfully')
      return true
    } catch (error) {
      log.error('[crawler] Failed to initialize crawler service:', error)
      return false
    }
  }

  /**
   * Crawl a URL using the Docker-based crawler
   */
  async crawl(options: CrawlOptions | string): Promise<CrawlResult | null> {
    const crawlOptions: CrawlOptions = typeof options === 'string' ? { url: options } : options

    // Ensure initialized
    if (!(await this.initialize())) {
      log.error('[crawler] Service not initialized, cannot crawl')
      return null
    }

    try {
      const { url } = crawlOptions

      log.info(`[crawler] Starting to crawl ${url}`)

      // Prepare browser configuration
      const browserConfig = {
        headless: true,
        viewport_width: 1280,
        viewport_height: 720,
        java_script_enabled: true,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        use_persistent_context: crawlOptions.persistentContext || false,
        user_data_dir: crawlOptions.userDataDir
      }

      // Prepare crawler parameters
      const crawlerParams = {
        stream: false,
        cache_mode: crawlOptions.cacheMode || 'smart',
        wait_until: 'domcontentloaded',
        page_timeout: 60000,
        delay_before_return_html: 2.0,
        simulate_user: true,
        override_navigator: true,
        magic: true,
        scan_full_page: true,
        remove_overlay_elements: true,
        process_iframes: true,
        light_mode: crawlOptions.useLightMode || false,
        text_mode: crawlOptions.useTextMode || false
      }

      // Prepare the request body
      const requestBody = {
        url,
        crawler_params: crawlerParams,
        browser_params: browserConfig,
        session_id: crawlOptions.sessionId
      }

      // Make the crawl request
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(90000) // 90 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        log.error(`[crawler] HTTP error ${response.status}: ${errorText}`)
        return {
          url,
          status_code: response.status,
          error: errorText,
          metadata: {}
        }
      }

      const result = await response.json()

      // Extract and format the result
      const crawlResult: CrawlResult = {
        url: result.url || url,
        markdown: result.markdown || result.content || '',
        content: result.content || result.markdown || '',
        html: result.html,
        metadata: {
          title: result.title || result.metadata?.title,
          description: result.description || result.metadata?.description,
          keywords: result.keywords || result.metadata?.keywords,
          author: result.author || result.metadata?.author,
          language: result.language || result.metadata?.language,
          ...result.metadata
        },
        status_code: result.status_code || 200
      }

      const contentLength = crawlResult.markdown?.length || 0
      log.info(`[crawler] Successfully crawled ${url} - ${contentLength} chars`)

      return crawlResult
    } catch (error) {
      log.error('[crawler] Crawl failed:', error)

      // Check if Docker is still available
      if (!(await dockerManager.isDockerRunning())) {
        log.error('[crawler] Docker is not running')
        this.initialized = false
      }

      return {
        url: typeof options === 'string' ? options : options.url,
        status_code: 500,
        error: error instanceof Error ? error.message : String(error),
        metadata: {}
      }
    }
  }

  /**
   * Create a new session for persistent crawling
   */
  async createSession(): Promise<string | null> {
    if (!(await this.initialize())) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        log.error(`[crawler] Failed to create session: ${response.status}`)
        return null
      }

      const result = await response.json()
      return result.session_id || null
    } catch (error) {
      log.error('[crawler] Failed to create session:', error)
      return null
    }
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/session/${sessionId}`, {
        method: 'DELETE'
      })

      return response.ok
    } catch (error) {
      log.error('[crawler] Failed to destroy session:', error)
      return false
    }
  }

  /**
   * Check if the crawler service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      })

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Close the crawler service
   */
  async close(): Promise<void> {
    try {
      if (this.initialized) {
        log.info('[crawler] Closing crawler service...')
        // Don't stop container, keep it running for future use
        // await dockerManager.stopContainer()
        this.initialized = false
      }
    } catch (error) {
      log.error('[crawler] Error closing crawler service:', error)
    }
  }
}

// Singleton instance
let crawlerServiceInstance: CrawlerService | null = null

/**
 * Get or create the crawler service instance
 */
export async function getCrawlerService(): Promise<CrawlerService> {
  if (!crawlerServiceInstance) {
    crawlerServiceInstance = new CrawlerService()
  }
  return crawlerServiceInstance
}

export { CrawlerService }
