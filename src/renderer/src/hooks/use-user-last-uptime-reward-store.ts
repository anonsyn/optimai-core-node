import { useRef } from 'react'

interface UptimeRewardStoreData {
  id: string
  reward: number
  timestamp: number
}

class UptimeRewardStore {
  key: string

  constructor() {
    this.key = `uptime-reward-data`
  }

  getData() {
    try {
      const data = localStorage.getItem(this.key)
      if (data) {
        const parsedData = JSON.parse(data) as UptimeRewardStoreData
        if (parsedData.id && parsedData.reward && parsedData.timestamp) {
          return parsedData
        }
      }
    } catch {
      return undefined
    }
    return undefined
  }

  setData(info: UptimeRewardStoreData) {
    localStorage.setItem(this.key, JSON.stringify(info))
  }

  removeData() {
    localStorage.removeItem(this.key)
  }
}

export const useUserUptimeRewardStore = () => {
  const userUptimeRewardStore = useRef(new UptimeRewardStore())

  return userUptimeRewardStore.current
}
