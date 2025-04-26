import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/tw'

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {}

const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <span className={cn('block', className)}>
      <Icon icon="LoaderCircle" className={cn('animate-spin text-current')} {...props} />
    </span>
  )
}

export default Spinner
