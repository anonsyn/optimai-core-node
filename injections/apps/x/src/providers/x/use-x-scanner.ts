import { useMemo } from 'react'

interface ScannerStatus {
  isScanning: boolean
  isPaused: boolean
  tweetCount: number
}

export const useScanner = () => {
  const api = useMemo(() => {
    let isScanning = false
    let isPaused = false
    const scannedTweetIds = new Set<string>()
    let scanInterval: number | null = null
    let scrollInterval: number | null = null
    // Track last scroll position (parity with vanilla)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let lastScrollPosition = 0

    const extractTweetId = (el: Element): string | null => {
      const link = el.querySelector('a[href*="/status/"]') as HTMLAnchorElement | null
      const match = link?.href.match(/\/status\/(\d+)/)
      return match ? match[1] : null
    }

    const scanForTweets = () => {
      const tweetElements = document.querySelectorAll('article[data-testid="tweet"]')
      let newCount = 0
      tweetElements.forEach((el) => {
        const id = extractTweetId(el)
        if (id && !scannedTweetIds.has(id)) {
          scannedTweetIds.add(id)
          newCount++
        }
      })
      return newCount
    }

    const performScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (window.pageYOffset >= maxScroll) return
      const distance = 400 + Math.random() * 400
      window.scrollBy({ top: distance, behavior: 'smooth' })
      lastScrollPosition = window.pageYOffset
    }

    const scheduleNextScroll = () => {
      const delay = 600 + Math.random() * 600
      scrollInterval = window.setTimeout(() => {
        if (!isPaused && isScanning) {
          performScroll()
          scheduleNextScroll()
        }
      }, delay)
    }

    const cleanup = () => {
      if (scanInterval) {
        clearInterval(scanInterval)
        scanInterval = null
      }
      if (scrollInterval) {
        clearTimeout(scrollInterval)
        scrollInterval = null
      }
    }

    return {
      startScan: () => {
        if (isScanning) return
        cleanup()
        isScanning = true
        isPaused = false
        scannedTweetIds.clear()
        lastScrollPosition = window.pageYOffset
        scanForTweets()
        scanInterval = window.setInterval(() => {
          if (!isPaused) scanForTweets()
        }, 1000)
        scheduleNextScroll()
      },
      pauseScan: () => {
        if (!isScanning) return
        isPaused = true
      },
      continueScan: () => {
        if (!isScanning) return
        if (!isPaused) return
        isPaused = false
        scheduleNextScroll()
      },
      stopScan: () => {
        if (!isScanning) return
        cleanup()
        isScanning = false
        isPaused = false
      },
      getScannedTweets: (): Record<string, boolean> => {
        const record: Record<string, boolean> = {}
        scannedTweetIds.forEach((id) => {
          record[id] = true
        })
        return record
      },
      getScannedTweetsArray: (): string[] => Array.from(scannedTweetIds),
      clearScannedTweets: () => {
        scannedTweetIds.clear()
      },
      getStatus: (): ScannerStatus => ({ isScanning, isPaused, tweetCount: scannedTweetIds.size })
    }
  }, [])

  return api
}
