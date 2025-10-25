import * as React from 'react'

import { cn } from '@/utils/tw'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = ({ className, ...props }: TextareaProps) => {
  return (
    <textarea
      className={cn(
        'border-border bg-accent/50 text-foreground flex h-11 w-full rounded-lg border px-3 py-2 leading-normal font-normal outline-1 transition-colors outline-none',
        'placeholder:text-muted-foreground',
        'placeholder-shown:border-accent/40 placeholder-shown:bg-accent/40',
        'focus-visible:border-border focus-visible:bg-accent/50 focus-visible:outline-white',
        'invalid:border-destructive invalid:!bg-destructive/2 focus-visible:invalid:border-opacity-20 aria-invalid:border-destructive aria-invalid:!bg-destructive/2 focus-visible:aria-invalid:border-opacity-20',
        'disabled:border-secondary/80 disabled:bg-secondary/80 disabled:text-muted-foreground disabled:placeholder:text-muted-foreground',
        'resize-none',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
