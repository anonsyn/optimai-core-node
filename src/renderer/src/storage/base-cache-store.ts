/**
 * Base class for implementing cached storage with TTL (Time To Live) support
 */
export abstract class BaseCacheStore<T> {
  protected abstract key: string
  protected maxAge: number // in milliseconds

  constructor(maxAge: number = 10 * 60 * 1000) {
    // Default 10 minutes
    this.maxAge = maxAge
  }

  /**
   * Store data with timestamp
   */
  protected setCache(data: T): void {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    }
    try {
      localStorage.setItem(this.key, JSON.stringify(cacheEntry))
    } catch (error) {
      console.error(`Failed to cache data for key ${this.key}:`, error)
    }
  }

  /**
   * Get cached data if not expired
   */
  protected getCache(): T | null {
    try {
      const stored = localStorage.getItem(this.key)
      if (!stored) {
        return null
      }

      const cacheEntry = JSON.parse(stored) as {
        data: T
        timestamp: number
      }

      // Check if cache is expired
      const age = Date.now() - cacheEntry.timestamp
      if (age > this.maxAge) {
        this.clearCache()
        return null
      }

      return cacheEntry.data
    } catch (error) {
      console.error(`Failed to retrieve cached data for key ${this.key}:`, error)
      return null
    }
  }

  /**
   * Check if cache exists and is valid
   */
  isCacheValid(): boolean {
    try {
      const stored = localStorage.getItem(this.key)
      if (!stored) {
        return false
      }

      const cacheEntry = JSON.parse(stored) as {
        data: T
        timestamp: number
      }

      const age = Date.now() - cacheEntry.timestamp
      return age <= this.maxAge
    } catch {
      return false
    }
  }

  /**
   * Get the age of cached data in milliseconds
   */
  getCacheAge(): number | null {
    try {
      const stored = localStorage.getItem(this.key)
      if (!stored) {
        return null
      }

      const cacheEntry = JSON.parse(stored) as {
        data: T
        timestamp: number
      }

      return Date.now() - cacheEntry.timestamp
    } catch {
      return null
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(this.key)
    } catch (error) {
      console.error(`Failed to clear cache for key ${this.key}:`, error)
    }
  }

  /**
   * Update max age for the cache
   */
  setMaxAge(maxAge: number): void {
    this.maxAge = maxAge
  }

  /**
   * Get remaining time before cache expires (in milliseconds)
   */
  getRemainingTime(): number {
    const age = this.getCacheAge()
    if (age === null) {
      return 0
    }
    const remaining = this.maxAge - age
    return remaining > 0 ? remaining : 0
  }
}
