import { Badge } from '@/components/ui/badge'
import { withSign } from '@/utils/number'
import { useMemo } from 'react'

export interface DeltaBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  percentage?: number
  formatLabel?: () => string
}
const DeltaBadge = ({ value, percentage, formatLabel, ...props }: DeltaBadgeProps) => {
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
    : `${withSign(value)} ${percentage ? `(${percentage}%)` : ''}`

  return (
    <Badge {...props} variant={variant}>
      <span>{label}</span>
    </Badge>
  )
}

export default DeltaBadge
