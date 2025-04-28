import { cn } from '@/utils/tw'

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
}

const Feature = ({ className, disabled, ...props }: FeatureCardProps) => {
  return (
    <div
      className={cn('group bg-secondary/50 rounded-lg border border-white/4 pb-4', className)}
      data-disabled={disabled}
      {...props}
    />
  )
}

const FeatureBanner = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'pointer-events-none relative aspect-[22/25] h-auto w-full overflow-hidden group-data-[disabled=true]:opacity-50 lg:aspect-square',
        className
      )}
      {...props}
    />
  )
}

const FeatureContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('w-full space-y-1 px-2 group-data-[disabled=true]:opacity-50', className)}
      {...props}
    />
  )
}

const FeatureTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn(
        'text-16 text-foreground leading-relaxed font-semibold tracking-tight',
        className
      )}
      {...props}
    />
  )
}

const FeatureDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn('text-14 text-foreground/50 leading-relaxed', className)} {...props} />
}

export { Feature, FeatureBanner, FeatureContent, FeatureDescription, FeatureTitle }
