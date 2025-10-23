import { Card, CardContent, CardHeader, CardIcon, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLocalDeviceInfoQuery } from '@/queries/device'
import { cn } from '@/utils/tw'
import { Cpu, Fingerprint, Globe, MemoryStick, Monitor } from 'lucide-react'

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
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-14 tracking-tight text-white/50">{label}</span>
      <div className="group relative">
        <span className="text-16 block truncate font-medium tracking-tight text-white">
          {value}
        </span>
        {tooltip && (
          <div className="text-12 absolute top-full left-0 z-10 mt-1 hidden rounded bg-black/80 px-2 py-1 whitespace-nowrap text-white group-hover:block">
            {tooltip}
          </div>
        )}
      </div>
    </div>
  </div>
)

export const DeviceInfoCard = () => {
  const { data: localDeviceInfo, isLoading } = useLocalDeviceInfoQuery()

  const deviceId = (() => {
    const id = localDeviceInfo?.device_id
    if (!id) return null

    if (id.length < 12) {
      return id
    }

    return `${id.slice(0, 5)}...${id.slice(-5)}`
  })()

  const formatMemory = (memoryGb?: number) => {
    if (!memoryGb) return 'N/A'
    return `${memoryGb} GB`
  }

  const formatCores = (cores?: number) => {
    if (!cores) return 'N/A'
    return `${cores} ${cores === 1 ? 'Core' : 'Cores'}`
  }

  if (isLoading) {
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

  if (!localDeviceInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
          <CardIcon>
            <Monitor className="size-4" />
          </CardIcon>
        </CardHeader>
        <CardContent>
          <div className="text-14 text-white/50">We couldn&apos;t load device info</div>
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
      <CardContent className="pt-3">
        <div className="grid grid-cols-2 gap-6">
          <DeviceInfoItem
            icon={<Monitor className="size-4 text-white" />}
            label="IP Address"
            value={localDeviceInfo.ip_address}
          />
          <DeviceInfoItem
            icon={<Globe className="size-4 text-white" />}
            label="Location"
            value={localDeviceInfo.country}
          />
          <DeviceInfoItem
            icon={<Cpu className="size-4 text-white" />}
            label="Processor"
            value={formatCores(localDeviceInfo.cpu_cores)}
          />
          <DeviceInfoItem
            icon={<MemoryStick className="size-4 text-white" />}
            label="Memory"
            value={formatMemory(localDeviceInfo.memory_gb)}
          />
        </div>

        {/* Device ID Footer */}
        {localDeviceInfo.device_id && (
          <div className="mt-5 flex h-10 items-center gap-2 rounded-lg bg-white/5 px-3">
            <Fingerprint className="size-4.5 text-white/50" />
            <span className="text-14 font-mono font-medium text-white/50">{deviceId}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
