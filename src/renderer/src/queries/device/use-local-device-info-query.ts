import { useQuery } from '@tanstack/react-query'

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

      // Fetch fresh data from IPC
      console.log('[DeviceInfo] Fetching fresh data from IPC')
      const deviceInfo = await window.nodeIPC.getLocalDeviceInfo()

      return deviceInfo
    },
    refetchInterval: false,
    staleTime: 1000 * 60 * 10, // 10 minutes (matches cache duration)
    retry: options?.retry ?? false,
    enabled: options?.enabled
  })
}
