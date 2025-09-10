import { usePreventScroll } from '@xagent/hooks'
import { cn } from '@xagent/utils'
import { ReactNode } from 'react'
import { useOverlayState } from '../providers/overlay'

interface OverlayProps {
  children?: ReactNode
  className?: string
}

const Overlay = ({ children, className }: OverlayProps) => {
  const { isVisible } = useOverlayState()

  usePreventScroll(isVisible)

  if (!isVisible) return null

  return (
    <div className={cn('fixed inset-0 pointer-events-auto bg-black/60 z-50', className)}>
      {children}
    </div>
  )
}

export default Overlay
