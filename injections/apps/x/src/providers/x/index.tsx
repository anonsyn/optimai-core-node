import { createContext, ReactNode, useContext } from 'react'
import { useComposer } from './use-x-composer'
import { useScanner } from './use-x-scanner'
import { useSearch } from './use-x-search'
import { useTimeline } from './use-x-timeline'

// Unified X API type (matches vanilla xApi surface)
type XApi = {
  // composer
  postTweet: (opts: {
    text: string
    media?: File[]
  }) => Promise<{ tweetId: string; username: string } | null>
  quoteTweet: (opts: {
    text: string
    tweetId: string
    username: string
    media?: File[]
  }) => Promise<{ tweetId: string; username: string } | null>
  replyTweet: (opts: {
    text: string
    tweetId: string
    username: string
    media?: File[]
  }) => Promise<{ tweetId: string; username: string } | null>
  retweetTweet: (opts: { tweetId: string; username: string }) => Promise<boolean>
  likeTweet: (opts: { tweetId: string; username: string }) => Promise<boolean>
  // timeline
  accessHomeTimeline: (opts?: { waitForLoad?: boolean; timeout?: number }) => Promise<boolean>
  accessUserTimeline: (opts: {
    username: string
    waitForLoad?: boolean
    timeout?: number
  }) => Promise<boolean>
  pullTimeline: () => Promise<boolean>
  // search
  isOnSearchPage: (query?: string) => boolean
  focusSearchInput: () => Promise<boolean>
  searchTop: (query: string, waitForLoad?: boolean, timeout?: number) => Promise<boolean>
  searchLatest: (query: string, waitForLoad?: boolean, timeout?: number) => Promise<boolean>
  selectSearchTab: (tab: 'top' | 'latest' | 'people' | 'photos' | 'videos') => Promise<boolean>
  selectLatestTab: () => Promise<boolean>
  // scanner
  scanner: ReturnType<typeof useScanner>
}

const XApiContext = createContext<XApi | null>(null)

export const XProvider = ({ children }: { children: ReactNode }) => {
  const scanner = useScanner()
  const composer = useComposer()
  const search = useSearch()
  const timeline = useTimeline()

  const api = {
    // composer
    ...composer,
    // timeline
    ...timeline,
    // search
    ...search,
    // scanner (nested)
    scanner
  }
  console.log('asfasdfasdf23412343')

  return <XApiContext.Provider value={api}>{children}</XApiContext.Provider>
}

export const useXApi = () => {
  const api = useContext(XApiContext)
  if (!api) throw new Error('useXApi must be used within XProvider')
  return api
}

export { useInjectXApi } from './use-inject-x-api'
