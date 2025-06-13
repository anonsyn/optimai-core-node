export interface BrowserViewBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface NewWindowHandlerOptions {
  allowSameOrigin?: boolean
  allowExternal?: boolean
  navigateInCurrentView?: boolean
}

export interface BrowserDataOptions {
  dataFolderName?: string
  clearDataOnStartup?: boolean
  usePrivateSession?: boolean
}
