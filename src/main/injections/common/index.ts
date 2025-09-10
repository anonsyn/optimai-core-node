/**
 * Common APIs shared across all injection apps
 * These APIs interface with the same window objects injected by all apps
 */

export { default as terminalApi } from './terminal-api'
export { default as scrollApi } from './scroll-api'
export { default as overlayApi } from './overlay-api'

// Re-export types
export type { LogLevel } from './terminal-api'

/**
 * All common APIs bundled together
 */
import terminalApi from './terminal-api'
import scrollApi from './scroll-api'
import overlayApi from './overlay-api'

const commonApi = {
  terminal: terminalApi,
  scroll: scrollApi,
  overlay: overlayApi
}

export default commonApi