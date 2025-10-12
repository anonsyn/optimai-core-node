import { balanceFormatOptions } from '@/utils/number'
import NumberFlow from '@number-flow/react'

interface AnimatedNumberProps {
  value?: number
  format?: Omit<Intl.NumberFormatOptions, 'notation'> & {
    notation?: Exclude<Intl.NumberFormatOptions['notation'], 'scientific' | 'engineering'>
  }
}

const AnimatedNumber = ({ value, format }: AnimatedNumberProps) => {
  return <NumberFlow value={value || 0} trend={1} format={format || balanceFormatOptions} />
}

export default AnimatedNumber
