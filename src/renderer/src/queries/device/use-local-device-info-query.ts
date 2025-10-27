import { useQuery } from '@tanstack/react-query'

import { deviceInfoStorage } from '@/storage/device-info-storage'
import { deviceKeys } from './keys'

interface Options {
  enabled?: boolean
  retry?: boolean
  useCache?: boolean // Allow disabling cache if needed
}

export const useLocalDeviceInfoQuery = (options?: Options) => {
  return useQuery({
    queryKey: deviceKeys.localDeviceInfo(),
    queryFn: async () => {
      // Check if cache should be used (default: true)
      const useCache = options?.useCache ?? true

      if (useCache) {
        // Try to get from storage first
        const cached = deviceInfoStorage.getDeviceInfo()
        if (cached) {
          console.log(
            `[DeviceInfo] Using cached data (age: ${deviceInfoStorage.getFormattedCacheAge()})`
          )
          return cached
        }
      }

      // Fetch fresh data from IPC
      console.log('[DeviceInfo] Fetching fresh data from IPC')
      const deviceInfo = await window.nodeIPC.getLocalDeviceInfo()

      // Store the fresh data
      if (useCache) {
        deviceInfoStorage.setDeviceInfo(deviceInfo)
        console.log('[DeviceInfo] Data stored for 10 minutes')
      }

      return deviceInfo
    },
    refetchInterval: false,
    staleTime: 1000 * 60 * 10, // 10 minutes (matches cache duration)
    retry: options?.retry ?? false,
    enabled: options?.enabled
  })
}
