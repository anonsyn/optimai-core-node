import { useEffect, useRef } from 'react'
import NavigationBar from './navigation-bar'
import Tabs from './tabs'

const BrowserPage = () => {
  const browserViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const showBrowserView = () => {
      if (browserViewRef.current) {
        const rect = browserViewRef.current.getBoundingClientRect()
        const bounds = {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }

        // Show browser view with specific bounds
        window.browserIPC.showBrowserViewWithBounds(bounds)
      } else {
        // Fallback to regular show if bounds can't be determined
        window.browserIPC.showBrowserView()
      }
    }

    // Small delay to ensure the component is fully rendered
    showBrowserView()

    // Hide browser view when component unmounts
    return () => {
      window.browserIPC.hideBrowserView()
    }
  }, [])

  return (
    <div className="grid h-full w-full grid-rows-[auto_minmax(0,1fr)]">
      <div className="rounded-tl-24 bg-secondary backdrop-blur-10 relative w-full">
        <div className="rounded-tl-24 pointer-events-none absolute inset-0 z-40 shadow-[4px_4px_12px_0px_rgba(0,0,0,0.50)_inset]" />
        <NavigationBar />
        <Tabs />
      </div>
      <div className="size-full" ref={browserViewRef} />
    </div>
  )
}

export default BrowserPage
