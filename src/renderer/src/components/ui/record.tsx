import { cn } from '@/utils/tw'
import { HTMLAttributes } from 'react'

interface RecordProps extends HTMLAttributes<HTMLDivElement> {}

const Record = ({ className, ...props }: RecordProps) => {
  return (
    <div
      className={cn(
        'group bg-secondary/50 text-foreground shadow-list-item flex items-center gap-3 rounded-lg px-4 py-3',
        className
      )}
      {...props}
    />
  )
}

const RecordIcon = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('bg-accent/80 rounded-lg p-2', className)} {...props} />
}

const RecordContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('flex flex-1 flex-col', className)} {...props} />
}

const RecordTitle = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn('text-14 leading-relaxed font-medium tracking-tight', className)} {...props} />
  )
}

const RecordDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn('text-12 leading-relaxed tracking-tight opacity-50', className)} {...props} />
  )
}

const RecordExtra = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('ml-auto flex flex-col', className)} {...props} />
}

export { Record, RecordContent, RecordDescription, RecordExtra, RecordIcon, RecordTitle }
