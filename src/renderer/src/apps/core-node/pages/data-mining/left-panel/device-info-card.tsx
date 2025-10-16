import { Card, CardContent, CardHeader, CardIcon, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/tw'
import { type DeviceInfo } from '@main/api/device/types'
import {
  Cpu,
  Fingerprint,
  Globe,
  Languages,
  MemoryStick,
  Monitor,
  Palette,
  Proportions,
  Scaling,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DeviceInfoItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
  className?: string
}

const DeviceInfoItem = ({ icon, label, value, className }: DeviceInfoItemProps) => (
  <div className={cn('flex items-center gap-3', className)}>
    <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">{icon}</div>
    <div className="flex flex-col">
      <span className="text-14 tracking-tight text-white/50">{label}</span>
      <span className="text-16 font-medium tracking-tight text-white">{value}</span>
    </div>
  </div>
)

export const DeviceInfoCard = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
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
    window.nodeIPC
      .getDeviceInfo()
      .then((info) => {
        setDeviceInfo(info.deviceInfo)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Failed to fetch device info:', error)
        setLoading(false)
      })
  }, [])

  const getOsName = (osName?: string, osVersion?: string) => {
    if (!osName) return 'Unknown OS'
    const osMap: Record<string, string> = {
      mac: 'macOS',
      win: 'Windows',
      linux: 'Linux'
    }
    const displayName = osMap[osName] || osName
    return osVersion ? `${displayName} ${osVersion}` : displayName
  }

  const formatMemory = (memoryGb?: number) => {
    if (!memoryGb) return 'N/A'
    return `${memoryGb} GB`
  }

  const formatCores = (cores?: number) => {
    if (!cores) return 'N/A'
    return `${cores} ${cores === 1 ? 'Core' : 'Cores'}`
  }

  const formatResolution = (width?: number, height?: number) => {
    if (!width || !height) return 'N/A'
    return `${width} × ${height}px`
  }

  const formatGPU = (vendor?: string, renderer?: string) => {
    if (!vendor && !renderer) return 'N/A'
    if (renderer && renderer.includes(vendor || '')) {
      return renderer
    }
    return [vendor, renderer].filter(Boolean).join(' - ')
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
          <div className="text-14 text-white/50">We couldn’t load device info</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Information</CardTitle>
        <CardIcon>
          <Monitor className="size-4" />
        </CardIcon>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-5">
          {/* System Information */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-13 font-semibold tracking-tight text-white/50 uppercase">
                System
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="space-y-6">
              <DeviceInfoItem
                icon={<Monitor className="size-4 text-white" />}
                label="Operating System"
                value={getOsName(deviceInfo.os_name, deviceInfo.os_version)}
              />
              <DeviceInfoItem
                icon={<Cpu className="size-4 text-white" />}
                label="Processor"
                value={formatCores(deviceInfo.cpu_cores)}
              />
              <DeviceInfoItem
                icon={<MemoryStick className="size-4 text-white" />}
                label="Memory"
                value={formatMemory(deviceInfo.memory_gb)}
              />
            </div>
          </div>

          {/* Display Information */}
          {(deviceInfo.screen_width_px || deviceInfo.screen_height_px) && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-13 font-semibold tracking-tight text-white/50 uppercase">
                  Display
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-6">
                <DeviceInfoItem
                  icon={<Proportions className="size-4 text-white" />}
                  label="Resolution"
                  value={formatResolution(deviceInfo.screen_width_px, deviceInfo.screen_height_px)}
                />
                {deviceInfo.color_depth && (
                  <DeviceInfoItem
                    icon={<Palette className="size-4 text-white" />}
                    label="Color Depth"
                    value={`${deviceInfo.color_depth}-bit`}
                  />
                )}
                {deviceInfo.scale_factor && deviceInfo.scale_factor !== 1 && (
                  <DeviceInfoItem
                    icon={<Scaling className="size-4 text-white" />}
                    label="Display Scale"
                    value={`${deviceInfo.scale_factor}x`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Graphics */}
          {(deviceInfo.webgl_vendor || deviceInfo.webgl_renderer) && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-13 font-semibold tracking-tight text-white/50 uppercase">
                  Graphics
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <DeviceInfoItem
                icon={<Zap className="size-4 text-white" />}
                label="GPU"
                value={formatGPU(deviceInfo.webgl_vendor, deviceInfo.webgl_renderer)}
              />
            </div>
          )}

          {/* Environment */}
          {(deviceInfo.language || deviceInfo.timezone) && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-13 font-semibold tracking-tight text-white/50 uppercase">
                  Environment
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-6">
                {deviceInfo.language && (
                  <DeviceInfoItem
                    icon={<Languages className="size-4 text-white" />}
                    label="Language"
                    value={deviceInfo.language.toUpperCase()}
                  />
                )}
                {deviceInfo.timezone && (
                  <DeviceInfoItem
                    icon={<Globe className="size-4 text-white" />}
                    label="Timezone"
                    value={deviceInfo.timezone}
                  />
                )}
              </div>
            </div>
          )}
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
