/**
 * Check if LinkedIn is loaded and ready
 */
export const isLinkedInReady = (): boolean => {
  return !!(
    document.querySelector('[data-app-name="voyager"]') ||
    document.querySelector('.global-nav') ||
    document.querySelector('#global-nav') ||
    document.querySelector('.feed-container-theme') ||
    window.location.hostname.includes('linkedin.com')
  )
}
