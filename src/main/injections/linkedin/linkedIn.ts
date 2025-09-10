// Type definitions
interface SearchOptions {
  type?: 'all' | 'people' | 'companies' | 'posts' | 'jobs'
}

/**
 * Search for content on LinkedIn
 */
const search = (query: string, options?: SearchOptions): string => {
  return `
    (async () => {
      try {
        const options = ${JSON.stringify(options || {})};
        const result = await window.linkedInApi.search(${JSON.stringify(query)}, options);
        console.log('Search result:', result);
        return result;
      } catch (error) {
        console.error('Failed to search:', error);
        throw error;
      }
    })()
  `
}

const navigateToHome = (): string => {
  return `
    (async () => {
      try {
        const result = await window.linkedInApi.navigateToHome();
        console.log('Navigation to home result:', result);
        return result;
      } catch (error) {
        console.error('Failed to navigate to home:', error);
        throw error;
      }
    })()
  `
}

const linkedInApi = {
  search,
  navigateToHome
}

export default linkedInApi
