# Crawler Migration Documentation

## Executive Summary

This document outlines the migration plan to move crawler functionality from the node-cli wrapper to direct integration within the Electron desktop application. Currently, the crawler service uses crawl4ai Docker container through the CLI, but since crawl4ai exposes HTTP APIs directly, we can eliminate the CLI intermediary layer.

## Current Architecture

### Overview
```
Electron App → IPC → CLI Server → Crawler Service → crawl4ai Docker → Web Content
```

### Components

#### 1. CLI Crawler Service (`/Users/tiendungnguyen/CodeSpace/opai/node-cli/node_cli/services/crawler_service.py`)

**Purpose**: Manages crawl4ai Docker container lifecycle and provides crawling capabilities

**Key Features**:
- Docker container management (pull, start, stop, health checks)
- Session management for browser tab reuse
- Performance optimization modes (light mode, text-only)
- Async/await support
- Comprehensive error handling

**Main Methods**:
```python
- initialize(): Sets up and starts Docker container
- crawl(url, ...): Full crawling with extensive options
- crawl_markdown(url): Simplified markdown-only extraction
- kill_session(session_id): Cleanup browser sessions
- close(): Container lifecycle management
```

#### 2. Docker Configuration

**Container Details**:
- **Image**: `unclecode/crawl4ai:0.7.4`
- **Container Name**: `opai_crawl4ai`
- **Port Mapping**: Host 11235 → Container 11235
- **Shared Memory**: 1GB (`--shm-size=1g`) for Chrome operations
- **Auto-restart**: No (managed by service)

**Environment Variables**:
```bash
CRAWL4AI_DOCKER_PORT=11235         # Container port
CRAWL4AI_IMAGE=unclecode/crawl4ai:0.7.4  # Docker image
CRAWL4AI_CONTAINER_NAME=opai_crawl4ai    # Container name
```

#### 3. crawl4ai Docker API

**Endpoints**:
- `GET http://localhost:11235/health` - Health check
- `POST http://localhost:11235/crawl` - Main crawling endpoint

**Request Payload Structure**:
```json
{
  "urls": ["https://example.com"],
  "browser_config": {
    "type": "BrowserConfig",
    "params": {
      "headless": true,
      "viewport_width": 1280,
      "viewport_height": 720,
      "java_script_enabled": true,
      "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "ignore_https_errors": true,
      "cookies": []
    }
  },
  "crawler_config": {
    "type": "CrawlerRunConfig",
    "params": {
      "stream": false,
      "cache_mode": "smart",
      "wait_until": "domcontentloaded",
      "page_timeout": 60000,
      "delay_before_return_html": 2.0,
      "simulate_user": true,
      "override_navigator": true,
      "magic": true,
      "scan_full_page": true,
      "remove_overlay_elements": true,
      "process_iframes": true,
      "adjust_viewport_to_content": false
    }
  },
  "session_id": "optional-session-id-for-reuse"
}
```

**Response Structure**:
```json
{
  "status": "success",
  "results": [{
    "url": "https://example.com",
    "success": true,
    "html": "<html>...</html>",
    "markdown": "# Markdown content...",
    "text": "Plain text content...",
    "metadata": {
      "title": "Page Title",
      "description": "Page description",
      "keywords": ["keyword1", "keyword2"],
      "author": "Author name",
      "favicon": "favicon.ico",
      "language": "en"
    },
    "media": {
      "images": [{"src": "...", "alt": "..."}],
      "videos": [],
      "audios": []
    },
    "links": {
      "internal": [],
      "external": []
    },
    "screenshot": "base64_encoded_screenshot",
    "extraction_rules": {}
  }],
  "error": null
}
```

#### 4. Current Integration with Mining Service

**Usage in `miner_service.py`**:
```python
# Service initialization
crawler_service = await get_crawler_service()

# Processing mining assignments
for assignment in assignments:
    if assignment["platform"] == "google":
        # Use crawler for Google search results
        crawl_result = await crawler_service.crawl(
            assignment["url"],
            text_only=False,
            wait_until="domcontentloaded",
            delay_before_return_html=2.0
        )

        # Extract and submit results
        content = crawl_result.get("markdown", "")
        await submit_assignment(assignment_id, content)
```

## Target Architecture

### Overview
```
Electron App → Direct HTTP → crawl4ai Docker → Web Content
```

### Benefits
1. **Reduced Complexity**: Eliminate CLI intermediary layer
2. **Better Performance**: Direct HTTP communication
3. **Easier Debugging**: Fewer moving parts
4. **Better Control**: Direct container management from Electron
5. **Resource Efficiency**: One less process running

## Migration Plan

### Phase 1: Docker Management Module

Create a new module in Electron to manage Docker container lifecycle.

**Location**: `src/main/services/docker/`

**Required Functionality**:
1. **Check Docker Availability**
   ```typescript
   async function isDockerAvailable(): Promise<boolean>
   ```

2. **Container Management**
   ```typescript
   async function isContainerRunning(name: string): Promise<boolean>
   async function pullImage(imageName: string): Promise<void>
   async function startContainer(config: ContainerConfig): Promise<void>
   async function stopContainer(name: string): Promise<void>
   ```

3. **Health Checks**
   ```typescript
   async function waitForHealthCheck(url: string, maxAttempts: number): Promise<boolean>
   ```

### Phase 2: Crawler Service Implementation

**Location**: `src/main/services/crawler/`

**Core Service Class**:
```typescript
interface CrawlerConfig {
  dockerPort: number
  imageName: string
  containerName: string
  healthCheckUrl: string
}

class CrawlerService {
  constructor(config: CrawlerConfig)
  async initialize(): Promise<void>
  async crawl(url: string, options?: CrawlOptions): Promise<CrawlResult>
  async crawlMarkdown(url: string): Promise<string>
  async killSession(sessionId: string): Promise<void>
  async shutdown(): Promise<void>
}
```

**Key Features to Implement**:
1. **Session Management**
   - Track session IDs for browser tab reuse
   - Map assignment IDs to session IDs
   - Cleanup stale sessions

2. **Performance Modes**
   - Light mode (faster, less accurate)
   - Full mode (slower, more complete)
   - Text-only mode (fastest, no media)

3. **Error Handling**
   - Container crash recovery
   - Network timeout handling
   - Docker unavailability fallback

### Phase 3: Renderer Integration

**Location**: `src/renderer/src/services/crawler/`

**Service Layer**:
```typescript
export const crawlerService = {
  async crawl(url: string, options?: CrawlOptions): Promise<CrawlResult> {
    return window.nodeIPC.crawl(url, options)
  },

  async crawlMarkdown(url: string): Promise<string> {
    return window.nodeIPC.crawlMarkdown(url)
  }
}
```

**IPC Bridge**:
```typescript
// In preload
crawl: (url: string, options?: CrawlOptions) =>
  ipcRenderer.invoke('crawler:crawl', url, options),
crawlMarkdown: (url: string) =>
  ipcRenderer.invoke('crawler:crawl-markdown', url)

// In main
ipcMain.handle('crawler:crawl', async (_, url, options) => {
  return crawlerService.crawl(url, options)
})
```

### Phase 4: Mining Service Update

Update mining assignment processing to use new crawler service:

```typescript
// Before (using CLI)
const result = await window.nodeIPC.processMiningAssignment(assignment)

// After (direct crawler)
if (assignment.platform === 'google') {
  const crawlResult = await crawlerService.crawl(assignment.url, {
    lightMode: true,
    sessionId: `mining-${assignment.id}`
  })
  const content = crawlResult.markdown || ''
  await miningService.submitAssignment(assignment.id, { content })
}
```

## Implementation Details

### 1. Docker Commands Implementation

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function isDockerAvailable(): Promise<boolean> {
  try {
    await execAsync('docker --version')
    return true
  } catch {
    return false
  }
}

async function isContainerRunning(name: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter name=${name} --format "{{.Names}}"`
    )
    return stdout.trim() === name
  } catch {
    return false
  }
}

async function pullImage(imageName: string): Promise<void> {
  await execAsync(`docker pull ${imageName}`)
}

async function startContainer(config: ContainerConfig): Promise<void> {
  const command = [
    'docker run -d',
    `-p ${config.port}:${config.port}`,
    `--name ${config.name}`,
    '--shm-size=1g',
    config.image
  ].join(' ')

  await execAsync(command)
}
```

### 2. HTTP Client for crawl4ai

```typescript
import axios from 'axios'

class Crawl4AIClient {
  private baseUrl: string

  constructor(port: number = 11235) {
    this.baseUrl = `http://localhost:${port}`
  }

  async health(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`)
      return response.status === 200
    } catch {
      return false
    }
  }

  async crawl(urls: string[], config: CrawlConfig): Promise<CrawlResponse> {
    const payload = {
      urls,
      browser_config: {
        type: 'BrowserConfig',
        params: config.browserParams || defaultBrowserParams
      },
      crawler_config: {
        type: 'CrawlerRunConfig',
        params: config.crawlerParams || defaultCrawlerParams
      },
      session_id: config.sessionId
    }

    const response = await axios.post(`${this.baseUrl}/crawl`, payload, {
      timeout: 120000 // 2 minutes timeout
    })

    return response.data
  }
}
```

### 3. Session Management

```typescript
class SessionManager {
  private sessions: Map<string, SessionInfo> = new Map()

  createSession(id: string, metadata?: any): string {
    const sessionId = `session-${id}-${Date.now()}`
    this.sessions.set(sessionId, {
      id: sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      metadata
    })
    return sessionId
  }

  getSession(id: string): SessionInfo | undefined {
    const session = this.sessions.get(id)
    if (session) {
      session.lastUsed = Date.now()
    }
    return session
  }

  async cleanupStaleSessions(maxAge: number = 3600000): Promise<void> {
    const now = Date.now()
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastUsed > maxAge) {
        await this.killSession(id)
        this.sessions.delete(id)
      }
    }
  }

  private async killSession(sessionId: string): Promise<void> {
    // Call crawler service to kill browser session
    await crawlerService.killSession(sessionId)
  }
}
```

## Configuration

### Environment Variables

Add to `.env`:
```env
# Crawler Configuration
CRAWLER_DOCKER_PORT=11235
CRAWLER_DOCKER_IMAGE=unclecode/crawl4ai:0.7.4
CRAWLER_CONTAINER_NAME=opai_crawl4ai
CRAWLER_HEALTH_CHECK_URL=http://localhost:11235/health
CRAWLER_MAX_RETRIES=3
CRAWLER_SESSION_TIMEOUT=3600000
```

### Default Configurations

```typescript
const defaultBrowserConfig = {
  headless: true,
  viewport_width: 1280,
  viewport_height: 720,
  java_script_enabled: true,
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  ignore_https_errors: true,
  cookies: []
}

const defaultCrawlerConfig = {
  stream: false,
  cache_mode: 'smart',
  wait_until: 'domcontentloaded',
  page_timeout: 60000,
  delay_before_return_html: 2.0,
  simulate_user: true,
  override_navigator: true,
  magic: true,
  scan_full_page: true,
  remove_overlay_elements: true,
  process_iframes: true,
  adjust_viewport_to_content: false
}

const lightModeConfig = {
  ...defaultCrawlerConfig,
  simulate_user: false,
  magic: false,
  scan_full_page: false,
  process_iframes: false,
  delay_before_return_html: 0.5
}
```

## Error Handling

### Docker-Related Errors

1. **Docker Not Available**
   ```typescript
   class DockerNotAvailableError extends Error {
     constructor() {
       super('Docker is not installed or not running')
     }
   }
   ```

2. **Container Start Failed**
   ```typescript
   class ContainerStartError extends Error {
     constructor(reason: string) {
       super(`Failed to start crawler container: ${reason}`)
     }
   }
   ```

3. **Health Check Failed**
   ```typescript
   class HealthCheckError extends Error {
     constructor(attempts: number) {
       super(`Container health check failed after ${attempts} attempts`)
     }
   }
   ```

### Crawling Errors

1. **Timeout Error**
   ```typescript
   class CrawlTimeoutError extends Error {
     constructor(url: string, timeout: number) {
       super(`Crawl timeout for ${url} after ${timeout}ms`)
     }
   }
   ```

2. **Invalid Response**
   ```typescript
   class InvalidCrawlResponse extends Error {
     constructor(url: string, status: string) {
       super(`Invalid crawl response for ${url}: ${status}`)
     }
   }
   ```

## Testing Strategy

### Unit Tests

1. **Docker Management**
   - Test container lifecycle methods
   - Mock docker commands
   - Test error scenarios

2. **Crawler Service**
   - Test initialization flow
   - Test crawl request building
   - Test response parsing
   - Test session management

3. **IPC Communication**
   - Test handler registration
   - Test data serialization
   - Test error propagation

### Integration Tests

1. **End-to-End Crawling**
   - Start container
   - Crawl test URLs
   - Verify response structure
   - Clean up sessions

2. **Mining Integration**
   - Process test assignments
   - Verify crawler invocation
   - Check result submission

### Manual Testing Checklist

- [ ] Docker installation detection
- [ ] Container auto-start on first use
- [ ] Crawl simple URL
- [ ] Crawl JavaScript-heavy site
- [ ] Session reuse verification
- [ ] Error recovery (container crash)
- [ ] Performance mode comparison
- [ ] Mining assignment processing
- [ ] Container cleanup on app exit

## Migration Checklist

### Pre-Migration
- [ ] Document current CLI crawler usage
- [ ] Identify all crawler touchpoints
- [ ] Test crawl4ai Docker directly
- [ ] Verify Docker availability on target machines

### Implementation
- [ ] Create Docker management module
- [ ] Implement crawler service
- [ ] Add IPC handlers
- [ ] Create renderer service layer
- [ ] Update mining service
- [ ] Add configuration management
- [ ] Implement error handling
- [ ] Add logging and monitoring

### Testing
- [ ] Unit test coverage >80%
- [ ] Integration tests passing
- [ ] Manual testing complete
- [ ] Performance benchmarks met

### Deployment
- [ ] Update environment variables
- [ ] Update installation documentation
- [ ] Create troubleshooting guide
- [ ] Plan rollback strategy

### Post-Migration
- [ ] Remove CLI crawler code
- [ ] Update CLAUDE.md
- [ ] Monitor for issues
- [ ] Collect performance metrics

## Performance Considerations

### Optimization Strategies

1. **Session Reuse**
   - Keep browser tabs alive between crawls
   - Map assignment IDs to sessions
   - Significant performance improvement (2-3x faster)

2. **Mode Selection**
   - Light mode for quick extraction
   - Full mode for complete content
   - Text-only for maximum speed

3. **Concurrent Crawling**
   - crawl4ai supports multiple concurrent sessions
   - Limit based on system resources
   - Consider rate limiting for target sites

### Resource Management

1. **Memory**
   - Browser processes consume significant RAM
   - Monitor and limit concurrent sessions
   - Implement session timeout and cleanup

2. **CPU**
   - Chrome rendering is CPU-intensive
   - Throttle concurrent crawls on low-end machines
   - Provide user-configurable limits

3. **Network**
   - Implement retry logic for failures
   - Cache Docker image locally
   - Consider bandwidth limitations

## Security Considerations

1. **Container Isolation**
   - Run container with minimal privileges
   - No host network access needed
   - Restrict volume mounts

2. **Input Validation**
   - Validate URLs before crawling
   - Sanitize crawler configuration
   - Prevent command injection in Docker commands

3. **Data Handling**
   - Sanitize crawled content
   - Be careful with JavaScript execution
   - Handle sensitive data appropriately

## Troubleshooting Guide

### Common Issues

1. **Container Won't Start**
   - Check Docker daemon status
   - Verify port availability
   - Check disk space for images
   - Review container logs

2. **Crawl Failures**
   - Verify target URL accessibility
   - Check network connectivity
   - Review timeout settings
   - Inspect response errors

3. **Performance Issues**
   - Monitor session count
   - Check memory usage
   - Review mode selection
   - Consider rate limiting

### Debug Commands

```bash
# Check container status
docker ps -a --filter name=opai_crawl4ai

# View container logs
docker logs opai_crawl4ai

# Inspect container
docker inspect opai_crawl4ai

# Test health endpoint
curl http://localhost:11235/health

# Remove container (for fresh start)
docker stop opai_crawl4ai && docker rm opai_crawl4ai
```

## Future Enhancements

1. **Advanced Features**
   - Custom extraction rules
   - Proxy support
   - Authentication handling
   - Cookie management

2. **Performance**
   - Implement caching layer
   - Add request queuing
   - Optimize Docker resource allocation
   - Consider native implementation for simple cases

3. **Monitoring**
   - Add metrics collection
   - Implement health dashboards
   - Create alerting system
   - Track success rates

4. **User Experience**
   - Add crawl progress indicators
   - Provide crawl history
   - Allow custom configurations
   - Show resource usage

## References

- [crawl4ai Documentation](https://github.com/unclecode/crawl4ai)
- [Docker API Reference](https://docs.docker.com/engine/api/)
- [Electron IPC Guide](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)

## Appendix

### A. Complete Type Definitions

```typescript
// Crawler Types
interface CrawlOptions {
  sessionId?: string
  lightMode?: boolean
  textOnly?: boolean
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
  pageTimeout?: number
  delayBeforeReturnHtml?: number
  simulateUser?: boolean
  magic?: boolean
  scanFullPage?: boolean
  removeOverlayElements?: boolean
  processIframes?: boolean
  adjustViewportToContent?: boolean
  screenshot?: boolean
  extractionRules?: ExtractionRule[]
}

interface CrawlResult {
  url: string
  success: boolean
  html?: string
  markdown?: string
  text?: string
  metadata?: PageMetadata
  media?: MediaContent
  links?: LinkContent
  screenshot?: string
  error?: string
}

interface PageMetadata {
  title?: string
  description?: string
  keywords?: string[]
  author?: string
  favicon?: string
  language?: string
}

interface MediaContent {
  images: MediaItem[]
  videos: MediaItem[]
  audios: MediaItem[]
}

interface MediaItem {
  src: string
  alt?: string
  title?: string
  type?: string
}

interface LinkContent {
  internal: string[]
  external: string[]
}

interface ExtractionRule {
  name: string
  selector: string
  attribute?: string
  multiple?: boolean
}
```

### B. Migration Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Docker Management | 2-3 days | None |
| Phase 2: Crawler Service | 3-4 days | Phase 1 |
| Phase 3: Renderer Integration | 2 days | Phase 2 |
| Phase 4: Mining Update | 1 day | Phase 3 |
| Testing & Refinement | 3-4 days | All phases |
| **Total** | **11-14 days** | |

### C. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Docker unavailable on user machines | High | Medium | Provide fallback or require Docker |
| Performance degradation | Medium | Low | Implement optimization strategies |
| Container management complexity | Medium | Medium | Thorough testing and error handling |
| Breaking changes in crawl4ai | Low | Low | Pin Docker image version |
| Network issues with Docker | Medium | Low | Implement retry logic |

---

*Document Version: 1.0*
*Last Updated: [Current Date]*
*Author: Claude*
*Status: Planning Phase*