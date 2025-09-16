interface CompactNumberOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}
export const formatNumber = (value: number | undefined, options?: CompactNumberOptions) => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits || 0,
    maximumFractionDigits: options?.maximumFractionDigits || 4
  })

  return formatter.format(value || 0)
}

export const balanceFormatOptions: CompactNumberOptions = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
}

export const padStart = (value: number, length: number) => {
  return value.toString().padStart(length, '0')
}

interface CompactNumberOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}
export const compactNumber = (value: number, options?: CompactNumberOptions) => {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: options?.minimumFractionDigits || 0,
    maximumFractionDigits: options?.maximumFractionDigits || 4
  })

  return formatter.format(value)
}

export const compactNumberWithUnit = (value: number, options?: CompactNumberOptions) => {
  if (value >= 1000) {
    const compactedNumber = compactNumber(value, options)
    // 1.2K => return {value: '1.2', unit: 'K'}
    const unit = compactedNumber.slice(-1)
    const newValue = compactedNumber.slice(0, -1)
    return { value: newValue, unit }
  } else {
    const unit = 'K'
    if (value === 0) {
      return { value: '0', unit }
    }
    const newValue = compactNumber(value * 1000, options)
    return {
      value: newValue.slice(0, -1),
      unit
    }
  }
}

export const withSign = (value: number | undefined) => {
  if (!value) return '0'
  return value > 0 ? `+${value}` : value
}
