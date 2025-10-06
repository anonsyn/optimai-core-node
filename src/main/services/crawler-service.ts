import axios from 'axios'
import log from 'electron-log/main'
import { getErrorMessage } from '../utils/get-error-message'
import { crawl4AiService } from './crawl4ai-service'

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

class CrawlerService {
  private baseUrl: string | null = null
  private initialized: boolean = false
  private initializationPromise: Promise<boolean> | null = null
  private servicePort: number | null = null

  constructor() {
    // Port will be set dynamically during initialization
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

      // Initialize Crawl4AI service
      const crawl4AiReady = await crawl4AiService.initialize()
      if (!crawl4AiReady) {
        log.error('[crawler] Failed to initialize Crawl4AI service')
        return false
      }

      // Get the base URL from Crawl4AI service
      const baseUrl = crawl4AiService.getBaseUrl()
      const port = crawl4AiService.getPort()

      if (!baseUrl || !port) {
        log.error('[crawler] Crawl4AI service URL or port not available')
        return false
      }

      this.servicePort = port
      this.baseUrl = baseUrl
      log.info(`[crawler] Crawler service using ${baseUrl}`)

      // Verify the service is accessible
      const isHealthy = await this.waitForHealth()
      if (!isHealthy) {
        log.error('[crawler] Crawler service health check failed')
        return false
      }

      this.initialized = true
      log.info('[crawler] Crawler service initialized successfully')
      return true
    } catch (error) {
      log.error(
        '[crawler] Failed to initialize crawler service:',
        getErrorMessage(error, 'Failed to initialize crawler service')
      )
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
        page_timeout: 60000,
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
          timeout: 90000,
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
      log.error('[crawler] Crawl failed:', getErrorMessage(error, 'Crawl failed'))

      // Check if Crawl4AI service is still healthy
      const isHealthy = await crawl4AiService.checkHealth()
      if (!isHealthy) {
        log.error('[crawler] Crawl4AI service is not healthy')
        this.initialized = false
      }

      throw error
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
    if (!(await this.initialize())) {
      return null
    }

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
  async destroySession(sessionId: string): Promise<boolean> {
    if (!this.baseUrl) {
      return false
    }

    try {
      const response = await axios.delete(`${this.baseUrl}/session/${sessionId}`, {
        timeout: 10000,
        validateStatus: () => true
      })

      return response.status >= 200 && response.status < 300
    } catch (error) {
      log.error(
        '[crawler] Failed to destroy session:',
        getErrorMessage(error, 'Failed to destroy crawler session')
      )
      return false
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
    try {
      if (this.initialized) {
        log.info('[crawler] Closing crawler service...')
        // Cleanup Crawl4AI service (keeps container running)
        await crawl4AiService.cleanup()
        this.initialized = false
        this.baseUrl = null
        this.servicePort = null
      }
    } catch (error) {
      log.error(
        '[crawler] Error closing crawler service:',
        getErrorMessage(error, 'Error closing crawler service')
      )
    }
  }

  /**
   * Get the current service port
   */
  getServicePort(): number | null {
    return this.servicePort
  }
}

// Export singleton instance
export const crawlerService = new CrawlerService()

export { CrawlerService }
