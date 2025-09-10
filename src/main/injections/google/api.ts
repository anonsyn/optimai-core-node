// Google API functions

interface SearchParams {
  query: string
}

const performSearch = ({ query }: SearchParams): string => {
  return `
    (async () => {
      try {
        const result = await window.googleApi.performSearch(${JSON.stringify(query)});
        console.log('Google search result:', result);
        return result;
      } catch (error) {
        console.error('Failed to perform Google search:', error);
        throw error;
      }
    })()
  `
}

const getSearchResults = (): string => {
  return `
    (() => {
      try {
        const results = window.googleApi.getSearchResults();
        console.log('Google search results:', results.length, 'results found');
        return results;
      } catch (error) {
        console.error('Failed to get Google search results:', error);
        throw error;
      }
    })()
  `
}

const navigateToNextPage = (): string => {
  return `
    (() => {
      try {
        const result = window.googleApi.navigateToNextPage();
        console.log('Navigate to next page result:', result);
        return result;
      } catch (error) {
        console.error('Failed to navigate to next page:', error);
        throw error;
      }
    })()
  `
}

const hasNextPage = (): string => {
  return `
    (() => {
      try {
        const result = window.googleApi.hasNextPage();
        console.log('Has next page:', result);
        return result;
      } catch (error) {
        console.error('Failed to check if next page exists:', error);
        throw error;
      }
    })()
  `
}

const googleApi = {
  performSearch,
  getSearchResults,
  navigateToNextPage,
  hasNextPage
}

export default googleApi
