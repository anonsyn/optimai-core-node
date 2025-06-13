export const BrowserEvents = {
  ShowBrowserView: 'browser:show-browser-view',
  HideBrowserView: 'browser:hide-browser-view',
  DestroyBrowserView: 'browser:destroy-browser-view',
  NavigateToUrl: 'browser:navigate-to-url',
  CanGoBack: 'browser:can-go-back',
  CanGoForward: 'browser:can-go-forward',
  GoBack: 'browser:go-back',
  GoForward: 'browser:go-forward',
  Reload: 'browser:reload',
  GetCurrentUrl: 'browser:get-current-url',
  GetAllTabs: 'browser:get-all-tabs'
} as const
