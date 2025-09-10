/**
 * Check if Google is loaded and ready
 */
export const isGoogleReady = (): boolean => {
  return !!(
    document.querySelector('input[name="q"]') ||
    document.querySelector('textarea[name="q"]') ||
    document.querySelector('[role="combobox"]') ||
    document.querySelector('form[action="/search"]') ||
    window.location.hostname.includes('google.com')
  )
}
