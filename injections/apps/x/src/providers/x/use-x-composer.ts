import { insertTextIntoElement, sleep, waitForElement } from '@xagent/utils'
import { useMemo } from 'react'

type TweetInfo = { tweetId: string; username: string }

type PostTweetOptions = { text: string; media?: File[] }
type QuoteTweetOptions = PostTweetOptions & { tweetId: string; username: string }
type ReplyTweetOptions = PostTweetOptions & { tweetId: string; username: string }
type RetweetOptions = { tweetId: string; username: string }
type LikeOptions = { tweetId: string; username: string }

const X_SELECTORS = {
  composeTextarea: '[data-testid="tweetTextarea_0"]',
  modalComposeTextarea: '[role="dialog"] [data-testid="tweetTextarea_0"]',
  composeAttachments: '[role="dialog"] [data-testid="attachments"]',
  postButton: '[data-testid="tweetButtonInline"]',
  postButtonAlt: '[data-testid="tweetButton"]',
  modalPostButton: '[role="dialog"] [data-testid="tweetButton"]',
  tweetComposeButton: '[data-testid="SideNav_NewTweet_Button"]',
  confirmationDialog: '[data-testid="confirmationSheetDialog"]',
  confirmationCancel: '[data-testid="confirmationSheetCancel"]',
  quoteTweetButton: 'a[href="/compose/post"][role="menuitem"]',
  modalFilesInput: '[role="dialog"] [data-testid="fileInput"]',
  filesInput: '[data-testid="fileInput"]',
  attachments: '[data-testid="attachments"]'
} as const

const navigateToTweetPage = async (username: string, tweetId: string) => {
  const tweetPath = `/${username}/status/${tweetId}`
  if (!window.location.pathname.includes(`/status/${tweetId}`)) {
    history.pushState({}, '', tweetPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
    await sleep(2000)
    await waitForElement('[data-testid="tweet"]', 10000)
  }
}

const openTweetCompose = async (): Promise<boolean> => {
  const selector = X_SELECTORS.modalComposeTextarea
  if (document.querySelector(selector)) return true
  const btn = document.querySelector(X_SELECTORS.tweetComposeButton) as HTMLButtonElement
  if (btn) {
    btn.click()
    try {
      await waitForElement(selector, 5000)
      return true
    } catch {
      /* no-op */
    }
  }
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', code: 'KeyN' }))
  try {
    await waitForElement(selector, 5000)
    return true
  } catch {
    return false
  }
}

const getFilesInput = (): HTMLInputElement | null => {
  const selectors = [X_SELECTORS.modalFilesInput, X_SELECTORS.filesInput]
  for (const selector of selectors) {
    const filesInput = document.querySelector(selector) as HTMLInputElement | null
    if (filesInput) return filesInput
  }
  return null
}

const waitForMediaAttachments = async () => {
  await Promise.race([
    waitForElement(X_SELECTORS.composeAttachments, 10000),
    waitForElement(X_SELECTORS.attachments, 10000)
  ])
}

const attachMedias = async (media: File[]) => {
  if (!media || media.length === 0) return
  const filesInput = getFilesInput()
  if (filesInput) {
    const dataTransfer = new DataTransfer()
    for (const file of media) dataTransfer.items.add(file)
    filesInput.files = dataTransfer.files
    filesInput.dispatchEvent(new Event('change', { bubbles: true }))
    const mediaCount = media.length
    await sleep(Math.min(mediaCount * 500, 10000))
    await waitForMediaAttachments()
  }
}

const dismissConfirmationDialog = async () => {
  try {
    await sleep(500)
    const dialog = document.querySelector(X_SELECTORS.confirmationDialog)
    if (!dialog) return
    const cancel = document.querySelector(
      X_SELECTORS.confirmationCancel
    ) as HTMLButtonElement | null
    if (cancel && !cancel.disabled) {
      cancel.click()
      await sleep(500)
    }
  } catch {
    /* no-op */
  }
}

const clickPostButton = async (timeoutMs = 30000): Promise<boolean> => {
  const selectors = [X_SELECTORS.modalPostButton, X_SELECTORS.postButton, X_SELECTORS.postButtonAlt]
  const waitClickable = (btn: HTMLButtonElement): Promise<void> => {
    if (!btn.disabled) return Promise.resolve()
    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        observer.disconnect()
        reject(new Error('Timeout waiting for post button'))
      }, timeoutMs)
      const observer = new MutationObserver(() => {
        if (!btn.disabled) {
          clearTimeout(timeoutId)
          observer.disconnect()
          resolve()
        }
      })
      observer.observe(btn, { attributes: true, attributeFilter: ['disabled'] })
    })
  }
  for (const sel of selectors) {
    const btn = document.querySelector(sel) as HTMLButtonElement | null
    if (btn) {
      await sleep(500)
      await waitClickable(btn)
      btn.click()
      await sleep(800)
      await dismissConfirmationDialog()
      return true
    }
  }
  return false
}

const extractTweetInfoFromToast = async (): Promise<TweetInfo | null> => {
  await sleep(1000)
  try {
    const toastEl = await waitForElement('[data-testid="toast"]', 5000)
    if (!toastEl) return null
    const viewLink = (toastEl as Element).querySelector(
      'a[href*="/status/"]'
    ) as HTMLAnchorElement | null
    if (viewLink && viewLink.href) {
      const match = viewLink.href.match(/\/([^/]+)\/status\/(\d+)/)
      if (match) {
        const username = match[1]
        const tweetId = match[2]
        viewLink.click()
        return { tweetId, username }
      }
    }
  } catch {
    /* no-op */
  }
  return null
}

export const useComposer = () => {
  const api = useMemo(() => {
    async function postTweet({ text, media }: PostTweetOptions): Promise<TweetInfo | null> {
      try {
        const opened = await openTweetCompose()
        if (!opened) throw new Error('Failed to open compose')
        const textarea = await waitForElement(X_SELECTORS.modalComposeTextarea, 5000)
        if (!textarea) throw new Error('No textarea found')
        const inserted = await insertTextIntoElement(textarea, text)
        if (!inserted) throw new Error('Failed to insert text')
        await sleep(2000)
        if (media && media.length > 0) {
          await attachMedias(media)
        }
        const posted = await clickPostButton()
        if (!posted) throw new Error('Failed to click post')
        const info = await extractTweetInfoFromToast()
        if (info) return info
      } catch {
        /* no-op */
      }
      return null
    }

    async function quoteTweet({
      text,
      media,
      tweetId,
      username
    }: QuoteTweetOptions): Promise<TweetInfo | null> {
      try {
        await navigateToTweetPage(username, tweetId)
        const tweetArticle = await waitForElement('article[data-testid="tweet"]', 5000)
        if (!tweetArticle) throw new Error('Tweet article not found')
        const menuBtn = tweetArticle.querySelector(
          '[data-testid="retweet"], [data-testid="unretweet"]'
        ) as HTMLElement | null
        if (!menuBtn) throw new Error('Retweet menu button not found')
        menuBtn.click()
        await sleep(400)
        const quoteBtn = await waitForElement(X_SELECTORS.quoteTweetButton, 3000)
        if (!quoteBtn) throw new Error('Quote option not found')
        ;(quoteBtn as HTMLElement).click()
        await sleep(600)
        const textarea = await waitForElement(X_SELECTORS.modalComposeTextarea, 5000)
        if (!textarea) throw new Error('Compose modal not found')
        const inserted = await insertTextIntoElement(textarea, text)
        if (!inserted) throw new Error('Failed to insert text')
        await sleep(400)
        if (media && media.length > 0) {
          await attachMedias(media)
        }
        const posted = await clickPostButton()
        if (!posted) throw new Error('Failed to post quote')
        const info = await extractTweetInfoFromToast()
        if (info) return info
      } catch {
        /* no-op */
      }
      return null
    }

    async function replyTweet({
      text,
      media,
      tweetId,
      username
    }: ReplyTweetOptions): Promise<TweetInfo | null> {
      try {
        await navigateToTweetPage(username, tweetId)
        const textarea = await waitForElement('[data-testid="tweetTextarea_0"]', 5000)
        if (!textarea) throw new Error('Reply textarea not found')
        ;(textarea as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
        await sleep(400)
        const inserted = await insertTextIntoElement(textarea, text)
        if (!inserted) throw new Error('Failed to insert reply text')
        await sleep(1000)
        if (media && media.length > 0) {
          await attachMedias(media)
        }
        const posted = await clickPostButton()
        if (!posted) throw new Error('Failed to post reply')
        const info = await extractTweetInfoFromToast()
        if (info) return info
      } catch {
        /* no-op */
      }
      return null
    }

    async function retweetTweet({ tweetId, username }: RetweetOptions): Promise<boolean> {
      try {
        await navigateToTweetPage(username, tweetId)
        const tweetArticle = await waitForElement('article[data-testid="tweet"]', 5000)
        if (!tweetArticle) throw new Error('Tweet article not found')
        const menuBtn = tweetArticle.querySelector(
          '[data-testid="retweet"], [data-testid="unretweet"]'
        ) as HTMLElement | null
        if (!menuBtn) throw new Error('Retweet menu button not found')
        menuBtn.click()
        await sleep(400)
        const confirm = document.querySelector(
          '[role="menuitem"][data-testid="retweetConfirm"]'
        ) as HTMLElement | null
        const undo = document.querySelector(
          '[role="menuitem"][data-testid="unretweetConfirm"]'
        ) as HTMLElement | null
        if (confirm) {
          confirm.click()
          await sleep(600)
          return true
        }
        if (undo) {
          document.body.click()
          menuBtn.click()
          return false
        }
      } catch {
        /* no-op */
      }
      return false
    }

    async function likeTweet({ tweetId, username }: LikeOptions): Promise<boolean> {
      try {
        await navigateToTweetPage(username, tweetId)
        const tweetArticle = await waitForElement('article[data-testid="tweet"]', 5000)
        if (!tweetArticle) throw new Error('Tweet article not found')
        const likeBtn = tweetArticle.querySelector(
          '[data-testid="like"], [data-testid="unlike"]'
        ) as HTMLElement | null
        if (!likeBtn) throw new Error('Like button not found')
        const isAlreadyLiked = likeBtn.getAttribute('data-testid') === 'unlike'
        if (isAlreadyLiked) return false
        likeBtn.click()
        await sleep(800)
        return true
      } catch {
        return false
      }
    }

    return { postTweet, quoteTweet, replyTweet, retweetTweet, likeTweet }
  }, [])

  return api
}
