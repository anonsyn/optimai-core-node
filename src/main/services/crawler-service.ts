import axios from 'axios'
import EventEmitter from 'eventemitter3'
import log from '../configs/logger'
import { isAppError, type AppError } from '../errors/error-codes'
import {
  crawlerCrawlFailedError,
  crawlerEndpointResolveError,
  crawlerHealthCheckTimeoutError,
  crawlerNotHealthyError,
  crawlerNotInitializedError,
  crawlerRestartFailedError,
  crawlerServiceUrlError,
  crawlerSessionDestroyError,
  unknownError
} from '../errors/error-factory'
import { getErrorMessage } from '../utils/get-error-message'
import { sleep } from '../utils/sleep'
import { crawl4AiService } from './docker/crawl4ai-service'

export interface CrawlOptions {
  url: string
  sessionId?: string
  useLightMode?: boolean
  useTextMode?: boolean
  cacheMode?: 'smart' | 'bypass' | 'force' | 'write_only' | 'read_only'
  persistentContext?: boolean
  userDataDir?: string
}

type BrowserConfigPayload = {
  headless: boolean
  viewport_width: number
  viewport_height: number
  java_script_enabled: boolean
  user_agent: string
  use_persistent_context: boolean
  user_data_dir?: string
  ignore_https_errors: boolean
}

type CrawlerParamsPayload = {
  stream: boolean
  cache_mode: string
  wait_until: string
  page_timeout: number
  delay_before_return_html: number
  simulate_user: boolean
  override_navigator: boolean
  magic: boolean
  scan_full_page: boolean
  remove_overlay_elements: boolean
  process_iframes: boolean
}

interface Crawl4AiCrawlRequest {
  urls: string[]
  browser_config?: {
    type: 'BrowserConfig'
    params: BrowserConfigPayload
  }
  crawler_config?: {
    type: 'CrawlerRunConfig'
    params: CrawlerParamsPayload
  }
}

interface Crawl4AiMarkdownPayload {
  raw_markdown?: string
  markdown_with_citations?: string
  references_markdown?: string
  fit_markdown?: string
  fit_html?: string
}

interface Crawl4AiCrawlResultEntry {
  url?: string
  html?: string
  extracted_content?: string
  markdown?: Crawl4AiMarkdownPayload
  metadata?: Record<string, unknown>
}

interface Crawl4AiCrawlResponse {
  success?: boolean
  results?: Crawl4AiCrawlResultEntry[]
}

export interface CrawlResult {
  markdown?: string
  metadata?: Record<string, unknown>
}

export interface CrawlerRestartOptions {
  shouldRestart?: () => boolean
  maxAttempts?: number
  retryDelayMs?: number
  onRestartFailed?: (error: unknown) => void
  throwOnFailure?: boolean
}

export interface CrawlerAutoRestartOptions {
  enabled?: boolean
  checkIntervalMs?: number
  restartOptions?: CrawlerRestartOptions
}

export interface CrawlerInitializeOptions {
  autoRestart?: CrawlerAutoRestartOptions
}

type CrawlerServiceEvents = {
  ready: (info: { baseUrl: string; port: number }) => void
  closed: () => void
  error: (error: Error | AppError) => void
  restarting: (info: { attempt: number }) => void
  restarted: (info: { attempt: number; baseUrl: string; port: number }) => void
}

/**
 * Extract favicon URL from a webpage
 * @param url The page URL
 * @param html Optional HTML content to parse
 */
function extractFaviconUrl(url: string, html?: string): string {
  try {
    const parsedUrl = new URL(url)
    const domain = parsedUrl.hostname

    // If we have HTML content, try to extract favicon from link tags
    if (html) {
      // Patterns to match various favicon link formats
      const faviconPatterns = [
        /<link[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["']/gi,
        /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut\s+)?icon["']/gi,
        /<link[^>]*href=["']([^"']*favicon[^"']*)["'][^>]*rel=["'](?:shortcut\s+)?icon["']/gi,
        /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/gi
      ]

      for (const pattern of faviconPatterns) {
        const matches = html.match(pattern)
        if (matches && matches.length > 0) {
          // Extract href value from the matched link tag
          const hrefMatch = matches[0].match(/href=["']([^"']+)["']/)
          if (hrefMatch && hrefMatch[1]) {
            const faviconPath = hrefMatch[1].trim()
            if (faviconPath) {
              // Convert relative URL to absolute
              if (faviconPath.startsWith('http://') || faviconPath.startsWith('https://')) {
                return faviconPath
              }
              if (faviconPath.startsWith('//')) {
                return `${parsedUrl.protocol}${faviconPath}`
              }
              if (faviconPath.startsWith('/')) {
                return `${parsedUrl.protocol}//${parsedUrl.host}${faviconPath}`
              }
              // Relative path
              return new URL(faviconPath, url).href
            }
          }
        }
      }
    }

    // Fallback to Google's favicon service
    // This is reliable and works for most domains
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch (error) {
    log.debug('[crawler] Failed to extract favicon URL:', error)
    // Return Google favicon service as ultimate fallback
    try {
      const fallbackDomain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=64`
    } catch {
      return ''
    }
  }
}

class CrawlerService extends EventEmitter<CrawlerServiceEvents> {
  private baseUrl: string | null = null
  private initialized: boolean = false
  private initializationPromise: Promise<void> | null = null
  private servicePort: number | null = null
  private autoRestartConfig: Required<CrawlerAutoRestartOptions> = {
    enabled: true,
    checkIntervalMs: 15000,
    restartOptions: {}
  }
  private autoRestartTimer: NodeJS.Timeout | null = null
  private autoRestartInProgress = false

  constructor() {
    super()
    // Port will be set dynamically during initialization
  }

  private applyInitializeOptions(options?: CrawlerInitializeOptions) {
    if (!options?.autoRestart) {
      return
    }

    const { autoRestart } = options
    const mergedRestartOptions = autoRestart.restartOptions
      ? {
          ...this.autoRestartConfig.restartOptions,
          ...autoRestart.restartOptions
        }
      : this.autoRestartConfig.restartOptions

    this.autoRestartConfig = {
      enabled: autoRestart.enabled ?? this.autoRestartConfig.enabled,
      checkIntervalMs: autoRestart.checkIntervalMs ?? this.autoRestartConfig.checkIntervalMs,
      restartOptions: mergedRestartOptions
    }

    if (!this.autoRestartConfig.enabled) {
      this.stopAutoRestartMonitor()
    }
  }

  /**
   * Initialize the crawler service
   */
  async initialize(options?: CrawlerInitializeOptions): Promise<void> {
    this.applyInitializeOptions(options)

    if (this.initialized) {
      this.startAutoRestartMonitor()
      return
    }

    // If initialization is already in progress, wait for it
    if (this.initializationPromise) {
      await this.initializationPromise
      return
    }

    // Start initialization
    this.initializationPromise = this._doInitialize()
    try {
      await this.initializationPromise
    } finally {
      this.initializationPromise = null
    }
  }

  private async _doInitialize(): Promise<void> {
    try {
      log.info('[crawler] Initializing crawler service...')

      // Initialize Crawl4AI service
      await crawl4AiService.initialize()

      // Get the base URL from Crawl4AI service
      const baseUrl = crawl4AiService.getBaseUrl()
      const port = crawl4AiService.getPort()

      if (!baseUrl || !port) {
        log.error('[crawler] Crawl4AI service URL or port not available')
        throw crawlerServiceUrlError()
      }

      this.servicePort = port
      this.baseUrl = baseUrl
      log.debug(`[crawler] Crawler service using ${baseUrl}`)

      // Verify the service is accessible
      const isHealthy = await this.waitForHealth()
      if (!isHealthy) {
        log.error('[crawler] Crawler service health check failed')
        throw crawlerHealthCheckTimeoutError()
      }

      this.initialized = true
      log.info('[crawler] Crawler service initialized successfully')
      this.emit('ready', { baseUrl: this.baseUrl, port: this.servicePort })
      this.startAutoRestartMonitor()
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to initialize crawler service')
      log.error('[crawler] Failed to initialize crawler service:', message)
      const lastError = isAppError(error) ? error : unknownError(message)
      this.emit('error', lastError)
      throw lastError
    }
  }

  /**
   * Crawl a URL using the Docker-based crawler
   */
  async crawl(options: CrawlOptions | string): Promise<CrawlResult | null> {
    const crawlOptions: CrawlOptions = typeof options === 'string' ? { url: options } : options

    // Ensure initialized
    await this.initialize()

    if (!this.baseUrl) {
      log.error('[crawler] Base URL not set')
      return null
    }

    try {
      const { url } = crawlOptions

      log.info(`[crawler] Starting to crawl ${url}`)

      // Prepare browser configuration
      const browserParams: BrowserConfigPayload = {
        headless: true,
        viewport_width: 1280,
        viewport_height: 720,
        java_script_enabled: true,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        use_persistent_context: crawlOptions.persistentContext || false,
        user_data_dir: crawlOptions.userDataDir,
        ignore_https_errors: true
      }

      // Prepare crawler parameters
      const crawlerParams: CrawlerParamsPayload = {
        stream: false,
        cache_mode: crawlOptions.cacheMode || 'smart',
        wait_until: 'domcontentloaded',
        page_timeout: 180000,
        delay_before_return_html: 2.0,
        simulate_user: true,
        override_navigator: true,
        magic: true,
        scan_full_page: true,
        remove_overlay_elements: true,
        process_iframes: true
      }

      // Prepare the request body
      const requestBody: Crawl4AiCrawlRequest = {
        urls: [url],
        browser_config: {
          type: 'BrowserConfig',
          params: browserParams
        },
        crawler_config: {
          type: 'CrawlerRunConfig',
          params: crawlerParams
        }
      }

      // Make the crawl request
      const response = await axios.post<Crawl4AiCrawlResponse>(
        `${this.baseUrl}/crawl`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 180000,
          validateStatus: () => true
        }
      )

      const data = response.data

      console.log({ data })

      const result = Array.isArray(data?.results) ? data.results[0] : null

      const metadata = result?.metadata || {}
      const html = result?.html
      const markdown = result?.markdown?.raw_markdown || ''

      // Extract favicon URL
      const faviconUrl = extractFaviconUrl(url, html)

      // Add favicon to metadata
      if (faviconUrl) {
        metadata.favicon = faviconUrl
      }

      const crawlResult: CrawlResult = {
        markdown,
        metadata
      }

      return crawlResult
    } catch (error) {
      const message = getErrorMessage(error, 'Crawl failed')
      log.error('[crawler] Crawl failed:', message)

      // Check if Crawl4AI service is still healthy
      const isHealthy = await crawl4AiService.checkHealth()
      if (!isHealthy) {
        log.error('[crawler] Crawl4AI service is not healthy')
        this.initialized = false
      }

      throw crawlerCrawlFailedError(message)
    }
  }

  /**
   * Wait for the crawler service to become healthy
   */
  private async waitForHealth(maxRetries: number = 30, delayMs: number = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const healthy = await this.isHealthy()
      if (healthy) {
        return true
      }
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    return false
  }

  /**
   * Create a new session for persistent crawling
   */
  async createSession(): Promise<string | null> {
    await this.initialize()

    if (!this.baseUrl) {
      log.error('[crawler] Base URL not set')
      return null
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/session`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          validateStatus: () => true
        }
      )

      if (response.status < 200 || response.status >= 300) {
        log.error(`[crawler] Failed to create session: ${response.status}`)
        return null
      }

      const result = response.data
      return typeof result?.session_id === 'string' ? result.session_id : null
    } catch (error) {
      log.error(
        '[crawler] Failed to create session:',
        getErrorMessage(error, 'Failed to create crawler session')
      )
      return null
    }
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string): Promise<void> {
    if (!this.baseUrl) {
      throw crawlerNotInitializedError()
    }

    try {
      const response = await axios.delete(`${this.baseUrl}/session/${sessionId}`, {
        timeout: 10000,
        validateStatus: () => true
      })

      if (response.status < 200 || response.status >= 300) {
        throw crawlerSessionDestroyError(`Unexpected status ${response.status}`)
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to destroy crawler session')
      log.error('[crawler] Failed to destroy session:', message)
      throw crawlerSessionDestroyError(message)
    }
  }

  /**
   * Check if the crawler service is healthy
   */
  async isHealthy(): Promise<boolean> {
    if (!this.baseUrl) {
      return false
    }

    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 2000,
        validateStatus: () => true
      })

      return response.status >= 200 && response.status < 300
    } catch {
      return false
    }
  }

  /**
   * Close the crawler service
   */
  async close(): Promise<void> {
    this.stopAutoRestartMonitor()
    try {
      if (this.initialized) {
        log.info('[crawler] Closing crawler service...')
        // Cleanup Crawl4AI service (keeps container running)
        await crawl4AiService.cleanup()
        this.initialized = false
        this.baseUrl = null
        this.servicePort = null
        this.emit('closed')
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Error closing crawler service')
      log.error('[crawler] Error closing crawler service:', message)
    }
  }

  /**
   * Get the current service port
   */
  getServicePort(): number | null {
    return this.servicePort
  }

  /**
   * Check if the underlying container is running
   */
  async isContainerRunning(): Promise<boolean> {
    return crawl4AiService.isContainerRunning()
  }

  private stopAutoRestartMonitor() {
    if (this.autoRestartTimer) {
      clearInterval(this.autoRestartTimer)
      this.autoRestartTimer = null
    }
    this.autoRestartInProgress = false
  }

  private startAutoRestartMonitor() {
    if (!this.autoRestartConfig.enabled) {
      this.stopAutoRestartMonitor()
      return
    }

    const interval = Math.max(2000, this.autoRestartConfig.checkIntervalMs)

    if (this.autoRestartTimer) {
      clearInterval(this.autoRestartTimer)
      this.autoRestartTimer = null
    }

    const checkAndRecover = async () => {
      if (this.autoRestartInProgress || !this.initialized || this.initializationPromise) {
        return
      }

      this.autoRestartInProgress = true

      try {
        const containerRunning = await crawl4AiService.isContainerRunning()
        const healthy = containerRunning ? await this.isHealthy() : false

        if (!containerRunning || !healthy) {
          log.warn(
            `[crawler] Detected Crawl4AI container ${containerRunning ? 'unhealthy' : 'stopped'} - attempting auto restart`
          )

          const baseShouldRestart = this.autoRestartConfig.restartOptions.shouldRestart
          const shouldRestart = () => {
            if (!this.autoRestartConfig.enabled) {
              return false
            }
            return baseShouldRestart ? baseShouldRestart() : true
          }

          await this.restartContainer({
            ...this.autoRestartConfig.restartOptions,
            shouldRestart,
            throwOnFailure: this.autoRestartConfig.restartOptions.throwOnFailure ?? true
          })
        }
      } catch (error) {
        const message = getErrorMessage(error, 'Auto restart failed')
        log.error('[crawler] Auto restart failed:', message)
        // restartContainer already emits detailed errors
      } finally {
        this.autoRestartInProgress = false
      }
    }

    this.autoRestartTimer = setInterval(() => {
      void checkAndRecover()
    }, interval)

    void checkAndRecover()
  }

  /**
   * Restart the crawler container with configurable retry behaviour.
   */
  async restartContainer(options?: CrawlerRestartOptions): Promise<void> {
    const {
      shouldRestart = () => true,
      maxAttempts = 3,
      retryDelayMs = 2000,
      onRestartFailed,
      throwOnFailure = true
    } = options ?? {}

    const attemptLimit = Math.max(1, maxAttempts)
    const delayMs = Math.max(0, retryDelayMs)

    const shouldProceed = (): boolean => {
      try {
        return shouldRestart()
      } catch (error) {
        const message = getErrorMessage(error, 'Restart predicate failed')
        log.error('[crawler] shouldRestart callback threw an error:', message)
        return false
      }
    }

    if (!shouldProceed()) {
      log.debug('[crawler] Restart skipped because shouldRestart() returned false')
      return
    }

    let lastError: unknown

    for (let attempt = 1; attempt <= attemptLimit; attempt++) {
      if (!shouldProceed()) {
        log.debug(
          `[crawler] Restart aborted before attempt ${attempt} because shouldRestart() returned false`
        )
        return
      }

      if (this.initializationPromise) {
        try {
          await this.initializationPromise
        } catch (error) {
          lastError = error
        }
      }

      this.emit('restarting', { attempt })

      try {
        await this.close()
        await crawl4AiService.restartContainer()

        const baseUrl = crawl4AiService.getBaseUrl()
        const port = crawl4AiService.getPort()

        if (!baseUrl || !port) {
          throw crawlerEndpointResolveError()
        }

        this.baseUrl = baseUrl
        this.servicePort = port

        const healthy = await this.waitForHealth()
        if (!healthy) {
          throw crawlerNotHealthyError()
        }

        this.initialized = true
        this.emit('ready', { baseUrl, port })

        log.info(`[crawler] Restart attempt ${attempt} succeeded`)

        this.emit('restarted', {
          attempt,
          baseUrl,
          port
        })

        this.startAutoRestartMonitor()

        return
      } catch (error) {
        lastError = error
        const message = getErrorMessage(error, 'Failed to restart crawler service')
        log.error(`[crawler] Restart attempt ${attempt}/${attemptLimit} failed:`, message)

        if (attempt < attemptLimit) {
          await sleep(delayMs)
        }
      }
    }

    if (onRestartFailed) {
      onRestartFailed(lastError)
    }

    const error = isAppError(lastError)
      ? lastError
      : crawlerRestartFailedError(getErrorMessage(lastError, 'Failed to restart crawler service'))
    this.emit('error', error)

    if (throwOnFailure) {
      throw error
    }
  }

  /**
   * Restart the crawler environment by reinitializing the service.
   */
  async restartEnvironment(options?: CrawlerRestartOptions): Promise<void> {
    await this.restartContainer(options)
  }
}

// Export singleton instance
export const crawlerService = new CrawlerService()
