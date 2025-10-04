import Token from '@/components/branding/token'
import NodeUptimeCounter from '@/components/node-uptime-counter'
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
          <Card transition={{ delay: 0.2 }} className="relative overflow-hidden">
            {/* Gradient glow effect */}
            <div className="absolute top-0 right-0 size-32 rounded-full bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-transparent blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-2">
                    <Trophy className="size-4 text-yellow-500" />
                  </div>
                  <span className="text-12 font-medium tracking-wider text-white/60 uppercase">
                    Total Rewards
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Token className="size-10" />
                <div className="flex-1">
                  <div className="text-36 leading-none font-bold text-white">
                    <NumberFlow
                      value={stats?.total_rewards.amount || 0}
                      format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card transition={{ delay: 0.3 }} className="relative overflow-hidden p-4">
              <div className="absolute top-0 right-0 size-20 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-1.5">
                    <Cpu className="size-3.5 text-blue-400" />
                  </div>
                  <span className="text-11 font-medium tracking-wider text-white/50 uppercase">
                    Tasks
                  </span>
                </div>
                <div className="text-32 font-bold text-white">
                  <NumberFlow value={stats?.data_points || 0} />
                </div>
              </div>
            </Card>

            <Card transition={{ delay: 0.4 }} className="relative overflow-hidden p-4">
              <div className="absolute top-0 right-0 size-20 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-lg bg-purple-500/10 p-1.5">
                    <HardDrive className="size-3.5 text-purple-400" />
                  </div>
                  <span className="text-11 font-medium tracking-wider text-white/50 uppercase">
                    Storage
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-32 font-bold text-white">{storageValue}</span>
                  <span className="text-14 ml-1 text-white/50">{storageUnit}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Node Status and Uptime */}
          <Card transition={{ delay: 0.5 }}>
            {/* Status indicator bar */}
            {/* <div
              className={cn(
                'absolute top-0 left-0 h-full w-1 rounded-l-xl transition-all',
                nodeStatus === 'running' && 'from-positive to-positive/50 bg-gradient-to-b',
                nodeStatus === 'starting' &&
                  'from-warning to-warning/50 animate-pulse bg-gradient-to-b',
                nodeStatus === 'idle' && 'bg-gradient-to-b from-white/20 to-white/10'
              )}
            /> */}

            <div className="space-y-4">
              {/* Connection Status */}
              <div>
                <CardHeader
                  icon={<Activity className="size-4 text-white/60" />}
                  title="Node Status"
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'size-2.5 rounded-full shadow-lg',
                        nodeStatus === 'running'
                          ? 'bg-positive shadow-positive/50 animate-pulse'
                          : 'bg-white/20'
                      )}
                    />
                    <span className="text-18 font-semibold text-white">{getNodeStatusText()}</span>
                  </div>
                  {nodeStatus === 'running' && (
                    <span className="text-12 bg-positive/10 text-positive rounded-md px-2 py-1 font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Uptime Counter */}
              <div className="border-t border-white/5 pt-4">
                <div className="text-11 mb-3 font-medium tracking-wider text-white uppercase">
                  Total Node Uptime
                </div>
                <NodeUptimeCounter variant="default" />
              </div>

              {/* Device ID */}
              {deviceId && (
                <div className="border-t border-white/5 pt-3">
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
                    <div>
                      <div className="text-10 mb-0.5 tracking-wider text-white/40 uppercase">
                        Device ID
                      </div>
                      <div className="text-12 font-mono text-white/80">
                        {`${deviceId.slice(0, 8)}...${deviceId.slice(-8)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(deviceId)
                        // You could add a toast notification here
                      }}
                      className="rounded p-1.5 transition-colors hover:bg-white/10"
                      title="Copy Device ID"
                    >
                      <Icon icon="Copy" className="size-3.5 text-white/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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
