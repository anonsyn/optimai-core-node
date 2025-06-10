export const BrowserEvents = {
  ShowBrowserView: 'browser:show-browser-view',
  ShowBrowserViewWithBounds: 'browser:show-browser-view-with-bounds',
  HideBrowserView: 'browser:hide-browser-view',
  DestroyBrowserView: 'browser:destroy-browser-view',
  NavigateToUrl: 'browser:navigate-to-url',
  CanGoBack: 'browser:can-go-back',
  CanGoForward: 'browser:can-go-forward',
  GoBack: 'browser:go-back',
  GoForward: 'browser:go-forward',
  Reload: 'browser:reload',
  GetCurrentUrl: 'browser:get-current-url',
  SetNewWindowOptions: 'browser:set-new-window-options'
} as const
