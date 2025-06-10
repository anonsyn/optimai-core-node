import { useEffect, useRef } from 'react'

const BrowserPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const showBrowserView = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
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
    const timer = setTimeout(showBrowserView, 100)

    // Hide browser view when component unmounts
    return () => {
      clearTimeout(timer)
      window.browserIPC.hideBrowserView()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: 'transparent',
        borderTopLeftRadius: '24px',
        overflow: 'hidden'
      }}
    ></div>
  )
}

export default BrowserPage
