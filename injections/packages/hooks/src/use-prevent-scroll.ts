import { useEffect } from 'react'

const usePreventScroll = (shouldPrevent = true) => {
  useEffect(() => {
    if (!shouldPrevent) return

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const keydownHandler = (e: KeyboardEvent) => {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End']
      if (keys.includes(e.code)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Save and override body style

    document.addEventListener('wheel', wheelHandler, { passive: false })
    document.addEventListener('touchmove', touchMoveHandler, { passive: false })
    document.addEventListener('keydown', keydownHandler)

    return () => {
      document.removeEventListener('wheel', wheelHandler)
      document.removeEventListener('touchmove', touchMoveHandler)
      document.removeEventListener('keydown', keydownHandler)
    }
  }, [shouldPrevent])
}

export default usePreventScroll
