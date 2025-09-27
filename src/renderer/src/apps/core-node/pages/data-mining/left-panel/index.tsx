import Token from '@/components/branding/token'
import { Button, SecondaryText } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/mining'
import { nodeSelectors } from '@/store/slices/node'
import { cn } from '@/utils/tw'
import NumberFlow from '@number-flow/react'
import { filesize } from 'filesize'
import { motion } from 'framer-motion'
import { Activity, Cpu, HardDrive, Monitor, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, CardHeader } from './card'

export const LeftPanel = () => {
  const { data: stats } = useGetMiningStatsQuery()
  const nodeStatus = useSelector(nodeSelectors.status)
  const deviceId = useSelector(nodeSelectors.deviceId)
  const cycle = useSelector(nodeSelectors.cycle)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  const { storageUnit, storageValue } = (() => {
    const size = filesize((stats?.data_storage || 0) * 1024 * 1024 * 1024, {
      standard: 'jedec'
    })
    const [storageValue, storageUnit] = size.split(' ')
    return { storageValue, storageUnit }
  })()

  useEffect(() => {
    window.nodeIPC
      .getDeviceInfo()
      .then((info) => {
        setDeviceInfo(info.deviceInfo)
      })
      .catch(console.error)
  }, [])

  const getNodeStatusText = () => {
    return nodeStatus ? nodeStatus.charAt(0).toUpperCase() + nodeStatus.slice(1) : 'Offline'
  }

  const getOsName = () => {
    if (!deviceInfo?.os_name) return 'Unknown'
    const osMap: Record<string, string> = {
      mac: 'macOS',
      win: 'Windows',
      linux: 'Linux'
    }
    return osMap[deviceInfo.os_name] || deviceInfo.os_name
  }

  const handleDashboardClick = () => {
    window.open('https://node.optimai.network/', '_blank')
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ x: { duration: 0.4 }, opacity: { duration: 0.5 }, ease: 'easeOut' }}
      className="from-secondary/20 to-background relative h-full w-[420px] flex-shrink-0 border-r border-white/5 bg-gradient-to-b backdrop-blur-xl"
    >
      <ScrollArea className="h-full w-full">
        <div className="space-y-4 p-5">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-24 font-bold text-white">Node Dashboard</h1>
            <p className="text-13 mt-1 text-white/60">
              Monitor your contribution to the OptimAI network
            </p>
          </motion.div>

          {/* Earnings Overview */}
          <Card transition={{ delay: 0.2 }}>
            <CardHeader icon={<Trophy className="size-4 text-white/60" />} title="Total Rewards" />
            <div className="flex items-center gap-2">
              <Token className="size-8" />
              <span className="text-32 font-bold text-white">
                <NumberFlow
                  value={stats?.total_rewards.amount || 0}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
              </span>
            </div>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card transition={{ delay: 0.3 }} className="p-3">
              <CardHeader
                icon={<Cpu className="size-4 text-white/60" />}
                title="Tasks"
                className="mb-2"
              />
              <div className="text-28 font-bold text-white">
                <NumberFlow value={stats?.data_points || 0} />
              </div>
            </Card>
            <Card transition={{ delay: 0.4 }} className="p-3">
              <CardHeader
                icon={<HardDrive className="size-4 text-white/60" />}
                title="Storage"
                className="mb-2"
              />
              <div className="text-28 font-bold text-white">
                {storageValue}
                <span className="text-14 ml-1 font-medium text-white/40">{storageUnit}</span>
              </div>
            </Card>
          </div>

          {/* Connection Status */}
          <Card transition={{ delay: 0.5 }}>
            {/* Status bar on left */}
            <div
              className={cn(
                'absolute top-0 left-0 h-full w-0.5',
                nodeStatus === 'running' && 'bg-positive',
                nodeStatus === 'starting' && 'bg-warning animate-pulse',
                nodeStatus === 'idle' && 'bg-white/20'
              )}
            />

            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Activity className="size-4 text-white/60" />
                  <span className="text-12 text-white/60">Connection Status</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'size-2 rounded-full',
                      nodeStatus === 'running' ? 'bg-positive animate-pulse' : 'bg-white/20'
                    )}
                  />
                  <span className="text-16 font-medium text-white">{getNodeStatusText()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-12 mb-1 text-white/40">Uptime</div>
                <div className="text-18 font-medium text-white">
                  <NumberFlow value={cycle?.uptime || 0} format={{ style: 'unit', unit: 'hour' }} />
                </div>
              </div>
            </div>

            {deviceId && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.02] p-2">
                <div className="flex items-center gap-2">
                  <span className="text-11 text-white/40">Device ID</span>
                  <span className="text-11 font-mono text-white/80">
                    {`${deviceId.slice(0, 6)}...${deviceId.slice(-6)}`}
                  </span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(deviceId)}
                  className="opacity-60 transition-opacity hover:opacity-100"
                >
                  <Icon icon="Copy" className="size-3 text-white/60" />
                </button>
              </div>
            )}
          </Card>
          {/* Device Information */}
          <Card transition={{ delay: 0.6 }}>
            <CardHeader
              icon={<Monitor className="size-4 text-white/60" />}
              title="Device Information"
            />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-13 text-white/40">Operating System</span>
                <span className="text-14 text-white">{getOsName()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-13 text-white/40">Processor</span>
                <span className="text-14 text-white">{deviceInfo?.cpu_cores || 0} cores</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-13 text-white/40">Memory</span>
                <span className="text-14 text-white">{deviceInfo?.memory_gb || 0} GB RAM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-13 text-white/40">Display</span>
                <span className="text-14 text-white">
                  {deviceInfo?.screen_width_px && deviceInfo?.screen_height_px
                    ? `${deviceInfo.screen_width_px} × ${deviceInfo.screen_height_px}`
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </Card>

          {/* Action Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button className="mt-auto w-full" onClick={handleDashboardClick} variant="secondary">
              <SecondaryText>View Full Dashboard</SecondaryText>
            </Button>
          </motion.div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
