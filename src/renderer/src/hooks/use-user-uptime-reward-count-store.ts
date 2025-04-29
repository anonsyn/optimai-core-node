import { useRef } from 'react'

interface UptimeRewardCountStoreData {
  count: number
}

class UptimeRewardCountStore {
  key: string

  constructor() {
    this.key = `uptime-reward-count-data`
  }

  getData() {
    try {
      const data = localStorage.getItem(this.key)
      if (data) {
        const parsedData = JSON.parse(data) as UptimeRewardCountStoreData
        if (parsedData.count) {
          return parsedData
        }
      }
    } catch {
      return {
        count: 0
      }
    }
    return {
      count: 0
    }
  }

  setData(info: UptimeRewardCountStoreData) {
    localStorage.setItem(this.key, JSON.stringify(info))
  }

  increaseCount() {
    const data = this.getData()
    const newCount = data.count + 1
    this.setData({
      count: newCount
    })
  }

  get count() {
    const data = this.getData()
    return data.count
  }

  removeData() {
    localStorage.removeItem(this.key)
  }
}

export const useUserUptimeRewardCountStore = () => {
  const userUptimeRewardCountStore = useRef(new UptimeRewardCountStore())

  return userUptimeRewardCountStore.current
}
