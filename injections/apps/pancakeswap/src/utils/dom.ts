/**
 * Check if PancakeSwap is loaded
 */
export const isPancakeSwapReady = (): boolean => {
  // Check for PancakeSwap-specific elements
  return !!(
    document.querySelector('[class*="pancake"]') ||
    document.querySelector('#swap-page') ||
    window.location.hostname.includes('pancakeswap')
  )
}
