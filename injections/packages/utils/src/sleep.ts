/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Sleep for a random duration between min and max milliseconds
 */
export const randomSleep = (min: number, max: number) => {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min
  return sleep(duration)
}