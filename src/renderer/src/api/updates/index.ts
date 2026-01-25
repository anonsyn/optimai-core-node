import { publicMinerClient } from '@/libs/axios'

export type UpdatePlatform = 'win' | 'mac' | 'linux'

export interface UpdateGateResponse {
  platform: UpdatePlatform
  latestVersion: string
  feedUrl: string
  checkedAt: string
  cached?: boolean
}

export const getCoreNodeUpdateGate = async (platform: UpdatePlatform) => {
  const res = await publicMinerClient.get<UpdateGateResponse>('updates/core-node', {
    params: { platform }
  })
  return res.data
}
