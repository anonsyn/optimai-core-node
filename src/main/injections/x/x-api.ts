// Composer functions from x-api
const postTweet = (text: string): string => {
  return `
    (async () => {
      try {
        return await window.xApi.postTweet({ text: ${JSON.stringify(text)} });
      } catch (error) {
        console.error('Failed to post tweet:', error);
        throw error;
      }
    })()
  `
}

const postThread = (tweets: Array<{ text: string }>): string => {
  return `
    (async () => {
      try {
        await window.xApi.postThread({ tweets: ${JSON.stringify(tweets)} });
        console.log('Thread posted successfully!');
      } catch (error) {
        console.error('Failed to post thread:', error);
        throw error;
      }
    })()
  `
}

const quoteTweet = ({
  text,
  tweetId,
  username
}: {
  text: string
  tweetId: string
  username: string
}): string => {
  return `
    (async () => {
      try {
        return await window.xApi.quoteTweet({ 
          text: ${JSON.stringify(text)}, 
          tweetId: ${JSON.stringify(tweetId)}, 
          username: ${JSON.stringify(username)} 
        });
      } catch (error) {
        console.error('Failed to quote tweet:', error);
        throw error;
      }
    })()
  `
}

const replyTweet = ({
  text,
  tweetId,
  username
}: {
  text: string
  tweetId: string
  username: string
}): string => {
  return `
    (async () => {
      try {
        return await window.xApi.replyTweet({ 
          text: ${JSON.stringify(text)}, 
          tweetId: ${JSON.stringify(tweetId)}, 
          username: ${JSON.stringify(username)} 
        });
      } catch (error) {
        console.error('Failed to reply to tweet:', error);
        throw error;
      }
    })()
  `
}

const retweetTweet = ({ tweetId, username }: { tweetId: string; username: string }): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.retweetTweet({ 
          tweetId: ${JSON.stringify(tweetId)}, 
          username: ${JSON.stringify(username)} 
        });
        console.log('Retweet result:', result);
        return result;
      } catch (error) {
        console.error('Failed to retweet:', error);
        throw error;
      }
    })()
  `
}

const likeTweet = ({ tweetId, username }: { tweetId: string; username: string }): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.likeTweet({ 
          tweetId: ${JSON.stringify(tweetId)}, 
          username: ${JSON.stringify(username)} 
        });
        console.log('Like result:', result);
        return result;
      } catch (error) {
        console.error('Failed to like tweet:', error);
        throw error;
      }
    })()
  `
}

// Timeline functions
const accessHomeTimeline = (): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.accessHomeTimeline({ waitForLoad: true });
        console.log('Accessed home timeline:', result);
        return result;
      } catch (error) {
        console.error('Failed to access home timeline:', error);
        throw error;
      }
    })()
  `
}

const accessUserTimeline = (username: string): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.accessUserTimeline({ 
          username: ${JSON.stringify(username)}, 
          waitForLoad: true 
        });
        console.log('Accessed user timeline:', result);
        return result;
      } catch (error) {
        console.error('Failed to access user timeline:', error);
        throw error;
      }
    })()
  `
}

const isOnSearchPage = (query?: string): string => {
  return `
    (() => {
      try {
        const result = window.xApi.isOnSearchPage(${query ? JSON.stringify(query) : ''});
        console.log('Is on search page:', result);
        return result;
      } catch (error) {
        console.error('Failed to check search page:', error);
        throw error;
      }
    })()
  `
}

const focusSearchInput = (): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.focusSearchInput();
        console.log('Search input focused:', result);
        return result;
      } catch (error) {
        console.error('Failed to focus search input:', error);
        throw error;
      }
    })()
  `
}

const searchLatest = (query: string): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.searchLatest(${JSON.stringify(query)});
        console.log('Searched latest tweets:', result);
        return result;
      } catch (error) {
        console.error('Failed to search latest:', error);
        throw error;
      }
    })()
  `
}

const searchTop = (query: string): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.searchTop(${JSON.stringify(query)});
        console.log('Searched top tweets:', result);
        return result;
      } catch (error) {
        console.error('Failed to search top:', error);
        throw error;
      }
    })()
  `
}

const pullTimeline = (): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.pullTimeline();
        console.log('Pull timeline result:', result);
        return result;
      } catch (error) {
        console.error('Failed to pull timeline:', error);
        throw error;
      }
    })()
  `
}

// Scanner functions
const startScan = (): string => {
  return `
    (() => {
      try {
        window.xApi.scanner.startScan();
        console.log('Scanner started');
      } catch (error) {
        console.error('Failed to start scanner:', error);
        throw error;
      }
    })()
  `
}

const pauseScan = (): string => {
  return `
    (() => {
      try {
        window.xApi.scanner.pauseScan();
        console.log('Scanner paused');
      } catch (error) {
        console.error('Failed to pause scanner:', error);
        throw error;
      }
    })()
  `
}

const continueScan = (): string => {
  return `
    (() => {
      try {
        window.xApi.scanner.continueScan();
        console.log('Scanner continued');
      } catch (error) {
        console.error('Failed to continue scanner:', error);
        throw error;
      }
    })()
  `
}

const stopScan = (): string => {
  return `
    (() => {
      try {
        window.xApi.scanner.stopScan();
        console.log('Scanner stopped');
      } catch (error) {
        console.error('Failed to stop scanner:', error);
        throw error;
      }
    })()
  `
}

const getScannedTweets = (): string => {
  return `
    (() => {
      try {
        const tweets = window.xApi.scanner.getScannedTweets();
        console.log('Retrieved scanned tweets:', Object.keys(tweets).length);
        return tweets;
      } catch (error) {
        console.error('Failed to get scanned tweets:', error);
        throw error;
      }
    })()
  `
}

const getScannedTweetsArray = (): string => {
  return `
    (() => {
      try {
        const tweets = window.xApi.scanner.getScannedTweetsArray();
        console.log('Retrieved scanned tweets array:', tweets.length);
        return tweets;
      } catch (error) {
        console.error('Failed to get scanned tweets array:', error);
        throw error;
      }
    })()
  `
}

const clearScannedTweets = (): string => {
  return `
    (() => {
      try {
        window.xApi.scanner.clearScannedTweets();
        console.log('Cleared scanned tweets');
      } catch (error) {
        console.error('Failed to clear scanned tweets:', error);
        throw error;
      }
    })()
  `
}

const getScannerStatus = (): string => {
  return `
    (() => {
      try {
        const status = window.xApi.scanner.getStatus();
        console.log('Scanner status:', status);
        return status;
      } catch (error) {
        console.error('Failed to get scanner status:', error);
        throw error;
      }
    })()
  `
}

const selectSearchTab = (tabType: 'top' | 'latest' | 'people' | 'photos' | 'videos'): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.selectSearchTab(${JSON.stringify(tabType)});
        console.log('Select search tab result:', result);
        return result;
      } catch (error) {
        console.error('Failed to select search tab:', error);
        throw error;
      }
    })()
  `
}

const selectLatestTab = (): string => {
  return `
    (async () => {
      try {
        const result = await window.xApi.selectLatestTab();
        console.log('Select latest tab result:', result);
        return result;
      } catch (error) {
        console.error('Failed to select latest tab:', error);
        throw error;
      }
    })()
  `
}

const xApi = {
  // Composer functions
  postTweet,
  postThread,
  quoteTweet,
  replyTweet,
  retweetTweet,
  likeTweet,
  // Timeline functions
  accessHomeTimeline,
  accessUserTimeline,
  pullTimeline,
  // Search functions
  isOnSearchPage,
  focusSearchInput,
  searchLatest,
  searchTop,
  selectSearchTab,
  selectLatestTab,
  // Scanner functions
  startScan,
  pauseScan,
  continueScan,
  stopScan,
  getScannedTweets,
  getScannedTweetsArray,
  clearScannedTweets,
  getScannerStatus
}

export default xApi
