import { Card, CardContent, CardHeader, CardIcon, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/tw'
import type { DeviceDetail } from '@main/api/device/types'
import { type DeviceInfo } from '@main/api/device/types'
import { Cpu, Fingerprint, Globe, MemoryStick, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DeviceInfoItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
  tooltip?: string | number
  className?: string
}

const DeviceInfoItem = ({ icon, label, value, tooltip, className }: DeviceInfoItemProps) => (
  <div className={cn('flex items-center gap-3', className)}>
    <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">{icon}</div>
    <div className="flex flex-col flex-1 min-w-0">
      <span className="text-14 tracking-tight text-white/50">{label}</span>
      <div className="group relative">
        <span className="truncate text-16 font-medium tracking-tight text-white block">{value}</span>
        {tooltip && (
          <div className="absolute left-0 top-full mt-1 z-10 hidden whitespace-nowrap rounded bg-black/80 px-2 py-1 text-12 text-white group-hover:block">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  </div>
)

export const DeviceInfoCard = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [deviceDetail, setDeviceDetail] = useState<DeviceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const deviceId = (() => {
    const id = deviceInfo?.device_id || deviceInfo?.machine_id
    if (!id) return null

    if (id.length < 12) {
      return id
    }

    return `${id.slice(0, 5)}...${id.slice(-5)}`
  })()

  useEffect(() => {
    Promise.all([
      window.nodeIPC.getDeviceInfo(),
      window.nodeIPC.getDeviceDetails().catch((error) => {
        console.error('Failed to fetch device details:', error)
        return null
      })
    ])
      .then(([infoResult, detailResult]) => {
        setDeviceInfo(infoResult.deviceInfo)
        setDeviceDetail(detailResult)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch device info:', error)
        setLoading(false)
      })
  }, [])

  const formatMemory = (memoryGb?: number) => {
    if (!memoryGb) return 'N/A'
    return `${memoryGb} GB`
  }

  const formatCores = (cores?: number) => {
    if (!cores) return 'N/A'
    return `${cores} ${cores === 1 ? 'Core' : 'Cores'}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
          <CardIcon>
            <Monitor className="size-4" />
          </CardIcon>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!deviceInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
          <CardIcon>
            <Monitor className="size-4" />
          </CardIcon>
        </CardHeader>
        <CardContent>
          <div className="text-14 text-white/50">We couldn't load device info</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
        <CardIcon>
          <Monitor className="size-4" />
        </CardIcon>
      </CardHeader>
      <CardContent className="pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-6">
          {/* IP Address */}
          <DeviceInfoItem
            icon={<Monitor className="size-4 text-white" />}
            label="IP Address"
            value={deviceDetail?.ip_address || 'N/A'}
            tooltip={deviceDetail?.ip_address}
          />

          {/* Location */}
          <DeviceInfoItem
            icon={<Globe className="size-4 text-white" />}
            label="Location"
            value={deviceDetail?.country || deviceDetail?.country_code2 || 'N/A'}
            tooltip={deviceDetail?.country || deviceDetail?.country_code2}
          />

          {/* Processor */}
          <DeviceInfoItem
            icon={<Cpu className="size-4 text-white" />}
            label="Processor"
            value={formatCores(deviceInfo.cpu_cores)}
          />

          {/* Memory */}
          <DeviceInfoItem
            icon={<MemoryStick className="size-4 text-white" />}
            label="Memory"
            value={formatMemory(deviceInfo.memory_gb)}
          />
        </div>

        {/* Device ID Footer */}
        {(deviceInfo.device_id || deviceInfo.machine_id) && (
          <div className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-white/5 px-3">
            <Fingerprint className="size-4.5 text-white/50" />
            <span className="text-14 font-mono font-medium text-white/50">{deviceId}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
