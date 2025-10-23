import { useQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'local-device-info'
const RQUERY = () => [RQUERY_ROOT]

interface Options {
  enabled?: boolean
  retry?: boolean
}

export const useLocalDeviceInfoQuery = (options?: Options) => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: async () => {
      return window.nodeIPC.getLocalDeviceInfo()
    },
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: options?.retry ?? false,
    enabled: options?.enabled
  })
}
