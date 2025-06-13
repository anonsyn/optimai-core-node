import { BrowserTab } from './tab'
import type { BrowserDataOptions, NewWindowHandlerOptions } from './types'

export function createBrowserTab(
  id: number,
  url: string,
  dataOptions: BrowserDataOptions,
  newWindowOptions: NewWindowHandlerOptions
): BrowserTab {
  return new BrowserTab(id, url, dataOptions, newWindowOptions)
}
