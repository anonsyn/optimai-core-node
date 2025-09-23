/**
 * Generate a random number between min and max (inclusive)
 */
export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random boolean with optional probability
 */
export const randomBoolean = (probability = 0.5): boolean => {
  return Math.random() < probability
}

/**
 * Pick a random element from an array
 */
export const randomElement = <T>(array: T[]): T | undefined => {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate a random string of specified length
 */
export const randomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
