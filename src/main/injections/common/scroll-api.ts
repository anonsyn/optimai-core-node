/**
 * Common Scroll API used across all injection apps
 */
const scrollApi = {
  scrollBy: (yAmount: number): string => {
    return `
      (async () => {
        try {
          window.scrollBy({
            top: ${yAmount},
            left: 0,
            behavior: 'smooth'
          });
          console.log('Scrolled by ${yAmount} pixels');
        } catch (error) {
          console.error('Failed to scroll by amount:', error);
          throw error;
        }
      })()
    `
  },

  scrollToBottom: (): string => {
    return `
      (async () => {
        try {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            left: 0,
            behavior: 'smooth'
          });
          console.log('Scrolled to bottom');
        } catch (error) {
          console.error('Failed to scroll to bottom:', error);
          throw error;
        }
      })()
    `
  },

  scrollToTop: (): string => {
    return `
      (async () => {
        try {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
          console.log('Scrolled to top');
        } catch (error) {
          console.error('Failed to scroll to top:', error);
          throw error;
        }
      })()
    `
  },

  getScrollPosition: (): string => {
    return `
      (async () => {
        try {
          const position = window.scrollY || window.pageYOffset;
          console.log('Current scroll position:', position);
          return position;
        } catch (error) {
          console.error('Failed to get scroll position:', error);
          throw error;
        }
      })()
    `
  },

  isScrolledToBottom: (threshold = 10): string => {
    return `
      (async () => {
        try {
          const scrollY = window.scrollY || window.pageYOffset;
          const visibleHeight = window.innerHeight;
          const totalHeight = document.documentElement.scrollHeight;
          const isAtBottom = scrollY + visibleHeight >= totalHeight - ${threshold};
          console.log('Is scrolled to bottom:', isAtBottom);
          return isAtBottom;
        } catch (error) {
          console.error('Failed to check if scrolled to bottom:', error);
          throw error;
        }
      })()
    `
  }
}

export default scrollApi
