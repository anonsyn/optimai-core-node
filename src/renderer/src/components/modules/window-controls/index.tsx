import { OS } from '@/utils/os'
import { cn } from '@/utils/tw'
import React from 'react'
import { MacControls } from './mac'
import { WindowsControls } from './windows'

interface WindowControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  os: OS
}

const WindowControls = ({ os, className, ...props }: WindowControlsProps) => {
  const Controls = os === OS.MAC ? MacControls : WindowsControls
  return <Controls className={cn('no-drag', className)} {...props} />
}

export * from './mac'
export * from './windows'

export { WindowControls }
