import { useRef } from 'react'

interface UserDeviceData {
  deviceId?: string
  userIpId?: string
  active?: boolean
}

class UserDeviceStore {
  key: string
  fallback?: UserDeviceData

  constructor(fallback?: UserDeviceData) {
    this.key = `device-data`
    this.fallback = fallback || {
      deviceId: '',
      userIpId: '',
      active: true
    }
  }

  getData() {
    const data = localStorage.getItem(this.key)
    if (!data) {
      return this.fallback
    }
    try {
      return JSON.parse(data) as UserDeviceData
    } catch {
      return this.fallback
    }
  }

  setData(data: UserDeviceData) {
    localStorage.setItem(this.key, JSON.stringify(data))
  }

  removeData() {
    localStorage.removeItem(this.key)
  }

  get deviceId() {
    return this.getData()?.deviceId || ''
  }

  set deviceId(deviceId: string) {
    this.setData({ ...this.getData(), deviceId })
  }

  get userIpId() {
    return this.getData()?.userIpId || ''
  }

  set userIpId(userIpId: string) {
    this.setData({ ...this.getData(), userIpId })
  }

  get active(): boolean {
    return this.getData()?.active ?? true
  }

  set active(active: boolean) {
    this.setData({ ...this.getData(), active })
  }
}

export const useUserDeviceStore = () => {
  const userDeviceStore = useRef(new UserDeviceStore())

  return userDeviceStore.current
}
