import { Badge } from '@/components/ui/badge'
import { CompactNumberOptions, withSign } from '@/utils/number'
import { ComponentProps, useMemo } from 'react'

export interface DeltaBadgeProps extends ComponentProps<typeof Badge> {
  value?: number
  percentage?: number
  formatLabel?: () => string
  options?: CompactNumberOptions
}
const DeltaBadge = ({ value, percentage, formatLabel, options, ...props }: DeltaBadgeProps) => {
  const variant = useMemo(() => {
    if (value) {
      if (value > 0) {
        return 'success'
      }
      if (value < 0) {
        return 'destructive'
      }
    }

    return 'default'
  }, [value])

  const label = formatLabel
    ? formatLabel()
    : `${withSign(value, options)} ${percentage ? `(${percentage}%)` : ''}`

  return (
    <Badge {...props} variant={variant}>
      <span>{label}</span>
    </Badge>
  )
}

export default DeltaBadge
