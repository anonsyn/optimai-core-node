import { useRef } from 'react'

interface UptimeStoreData {
  uptime: number
  createdAt: number
  updatedAt: number
  refreshAt: number
}

class UptimeStore {
  key: string
  fallback?: UptimeStoreData

  constructor() {
    this.key = `uptime-data`
  }

  getData() {
    const data = localStorage.getItem(this.key)
    if (!data) {
      return this.createCycle()
    }
    try {
      const parsedData = JSON.parse(data) as UptimeStoreData
      if (!parsedData.refreshAt) {
        // If refreshAt is not set, create a new cycle
        return this.createCycle()
      }
      return parsedData
    } catch {
      return this.createCycle()
    }
  }

  createCycle(increaseRange?: boolean) {
    const isDev = import.meta.env.DEV || import.meta.env.VITE_ENV === 'test'

    const oneMinute = 1000 * 60

    const now = Date.now()
    const DEV_DURATION = Number(import.meta.env.VITE_DEV_DURATION_MINUTES) || 1
    const MIN_DURATION = Number(import.meta.env.VITE_MIN_DURATION_MINUTES) || 3
    const MAX_DURATION = Number(import.meta.env.VITE_MAX_DURATION_MINUTES) || 8
    // const INCREASE_RANGE = Number(import.meta.env.VITE_INCREASE_RANGE_MINUTES) || 10

    const minutesRange = [MIN_DURATION, MAX_DURATION]

    const randomMinutes = increaseRange
      ? Math.floor(Math.random() * (minutesRange[1] - minutesRange[0] + 1)) + minutesRange[0]
      : Math.random() < 0.5
        ? 0.5
        : 1 // Randomly select either 0.5 or 1

    const duration = isDev ? DEV_DURATION * oneMinute : randomMinutes * oneMinute

    const refreshAt = now + duration

    const uptime = {
      uptime: 0,
      createdAt: now,
      updatedAt: now,
      refreshAt
    }
    this.setData(uptime)
    return {
      ...uptime,
      duration
    }
  }

  setData(info: UptimeStoreData) {
    localStorage.setItem(this.key, JSON.stringify(info))
  }

  removeData() {
    localStorage.removeItem(this.key)
  }

  updateUptime(duration: number = 1000) {
    const data = this.getData()
    if (!data) {
      return
    }
    const uptime = data.uptime + duration
    const updatedAt = Date.now()
    this.setData({ ...data, uptime, updatedAt })
    return uptime
  }

  isExpired() {
    const data = this.getData()
    if (!data) {
      return true
    }
    return data.refreshAt <= Date.now()
  }
}

export const useUserUptimeStore = () => {
  const userUptimeStore = useRef(new UptimeStore())

  return userUptimeStore.current
}
