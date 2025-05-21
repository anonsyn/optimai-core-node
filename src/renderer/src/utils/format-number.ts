interface CompactNumberOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}
export const formatNumber = (value: number, options?: CompactNumberOptions) => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options?.minimumFractionDigits || 0,
    maximumFractionDigits: options?.maximumFractionDigits || 4
  })

  return formatter.format(value)
}

export const balanceFormatOptions: CompactNumberOptions = {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4
}

export const padStart = (value: number, length: number) => {
  return value.toString().padStart(length, '0')
}
