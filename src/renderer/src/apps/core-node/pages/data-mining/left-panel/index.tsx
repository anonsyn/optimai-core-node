import Token from '@/components/branding/token'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/mining'
import { formatNumber } from '@/utils/number'
import { filesize } from 'filesize'
import { motion } from 'framer-motion'
import { DataDistributionChart } from './data-distribution-chart'
import { LLMList } from './llm-list'
import { StatsCard } from './stats-card'

export const LeftPanel = () => {
  const { data: stats } = useGetMiningStatsQuery()

  const { storageUnit, storageValue } = (() => {
    const size = filesize((stats?.data_storage || 0) * 1024 * 1024 * 1024, {
      standard: 'jedec'
    })
    const [storageValue, storageUnit] = size.split(' ')
    return { storageValue, storageUnit }
  })()

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
        <div className="p-6 pb-8">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <Icon icon="Pickaxe" className="size-4 text-white/50" />
              <span className="text-12 font-medium text-white/50">Mining Hub</span>
            </div>
            <h1 className="text-28 font-bold text-white">Mining Statistics</h1>
            <p className="text-13 mt-2 leading-relaxed text-white/60">
              Track your mining performance, rewards, and data contribution across the OptimAI
              network.
            </p>
            <Button
              onClick={handleDashboardClick}
              className="bg-main group mt-4 w-full transition-all"
              variant="primary"
            >
              <span className="font-semibold text-black">Go to Dashboard</span>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Total Rewards - Full Width */}
            <StatsCard
              title="Total Rewards"
              value={formatNumber(stats?.total_rewards.amount || 0, {
                minimumFractionDigits: 2
              })}
              icon={<Token className="size-6" />}
              delay={0.1}
            />

            {/* Weekly Rank - Full Width */}
            <StatsCard
              title="Weekly Rank"
              value={`#${stats?.weekly_rank.current || 0}`}
              delay={0.2}
            />

            {/* Tasks and Storage */}
            <div className="grid grid-cols-2 gap-3">
              <StatsCard title="Tasks" value={stats?.data_points || 0} unit="tasks" delay={0.3} />
              <StatsCard title="Data Storage" value={storageValue} unit={storageUnit} delay={0.4} />
            </div>

            {/* Data Distribution */}
            <DataDistributionChart
              data={stats?.data_distribution || { video: 0, text: 0, image: 0, audio: 0 }}
            />

            {/* Supported LLMs */}
            <LLMList />
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
