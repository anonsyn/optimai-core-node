/**
 * Common Overlay API used across all injection apps
 */
const overlayApi = {
  show: (): string => {
    return `
      if (window.overlayApi && typeof window.overlayApi.show === 'function') {
        window.overlayApi.show();
      }
    `
  },

  hide: (): string => {
    return `
      if (window.overlayApi && typeof window.overlayApi.hide === 'function') {
        window.overlayApi.hide();
      }
    `
  },

  isVisible: (): string => {
    return `
      if (window.overlayApi && typeof window.overlayApi.isVisible === 'function') {
        return window.overlayApi.isVisible();
      }
      return false;
    `
  },

  // Aliases for backward compatibility
  showOverlay: (): string => {
    return overlayApi.show()
  },

  hideOverlay: (): string => {
    return overlayApi.hide()
  }
}

export default overlayApi
