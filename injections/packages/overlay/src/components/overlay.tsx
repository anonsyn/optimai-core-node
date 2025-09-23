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
    <div className={cn('pointer-events-auto fixed inset-0 z-50 bg-black/60', className)}>
      {children}
    </div>
  )
}

export default Overlay
