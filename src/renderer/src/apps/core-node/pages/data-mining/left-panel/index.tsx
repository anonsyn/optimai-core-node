import Token from '@/components/branding/token'
import { Badge } from '@/components/ui/badge'
import { Button, SecondaryText } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/mining'
import { formatNumber, withSign } from '@/utils/number'
import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

export const LeftPanel = () => {
  const { data: stats } = useGetMiningStatsQuery()
  console.log({ stats })

  const firstRow = [
    {
      title: 'Total Rewards',
      value: formatNumber(stats?.total_rewards.amount || 0, { minimumFractionDigits: 2 }),
      change: stats?.total_rewards.percentage_change,
      changeDisplay: `${Number(stats?.total_rewards.percentage_change) > 0 ? '+' : ''} ${formatNumber(
        stats?.total_rewards.percentage_change || 0,
        {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        }
      )}`,
      token: true
    },
    {
      title: 'Weekly Rank',
      value: stats?.weekly_rank.current,
      change: Number(stats?.weekly_rank.current) - Number(stats?.weekly_rank.previous),
      changeDisplay: `${Number(stats?.weekly_rank.current) - Number(stats?.weekly_rank.previous)} rank`
    }
  ]

  const secondRow = [
    {
      title: 'Data Points',
      value: formatNumber(stats?.data_points, { minimumFractionDigits: 2 })
    },
    {
      title: 'Data Storage',
      value: formatNumber(stats?.data_storage, { minimumFractionDigits: 2 })
    }
  ]

  const supportedLLMs = [
    'LLama 3.2 Vision',
    'Mistral',
    'LLama 3.3',
    'Phi 4',
    'Neural Chat',
    'Gemma 2'
  ]

  const supportedPlatforms = ['Twitter', 'Facebook', 'Telegram', 'Google', 'Discord', 'Instagram']

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="from-secondary/20 to-background relative h-full w-[420px] flex-shrink-0 border-r border-white/5 bg-gradient-to-b backdrop-blur-xl"
    >
      <ScrollArea className="h-full w-full">
        <div className="p-6 pb-8">
          <div className="mb-8">
            <div className="mb-1 flex items-center gap-2">
              <div className="bg-main h-1 w-12 rounded-full" />
              <span className="text-sm text-white/50">Mining Hub</span>
            </div>
            <h1 className="bg-main text-32 bg-clip-text leading-tight font-bold text-transparent">
              Data Mining DAO
            </h1>
            <p className="text-14 mt-3 leading-relaxed text-white">
              AI-powered agents continuously crawl, analyze, and validate data streams for real-time
              insights and rewards.
            </p>
            <Button
              className="bg-gradient-secondary-button group mt-4 w-full border border-white/10 transition-all hover:border-white/20"
              variant="secondary"
            >
              <SecondaryText className="group-hover:text-white">
                View Subscribed Data DAO
              </SecondaryText>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {firstRow.map((item, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent transition-all hover:border-white/10">
                      <div className="from-yellow/5 to-green/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <CardTitle className="text-12 text-white/50">{item.title}</CardTitle>
                      <CardContent className="items-start">
                        <Badge className="text-10 mb-2 gap-1" autoVariant={item.change}>
                          {!item.token && <TrendingUp className="size-3" />}{' '}
                          {item.changeDisplay || withSign(item.change)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {item.token && <Token className="size-6" />}
                          <span className="bg-main text-28 bg-clip-text font-bold text-transparent">
                            {item.value}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondRow.map((item, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + 0.1 * index, duration: 0.5 }}
                  >
                    <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent transition-all hover:border-white/10">
                      <div className="from-green/5 to-yellow/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <CardTitle className="text-12 text-white/50">{item.title}</CardTitle>
                      <CardContent>
                        <span className="text-28 font-bold text-white">{item.value}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent transition-all hover:border-white/10">
                <div className="from-yellow/5 to-green/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100" />
                <CardTitle className="flex items-center justify-between">
                  <span className="text-12 text-white/50">Supported LLMs</span>
                  <span className="bg-main text-10 rounded-full bg-clip-text px-2 py-0.5 font-bold text-transparent">
                    {supportedLLMs.length}
                  </span>
                </CardTitle>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supportedLLMs.map((llm, index) => (
                      <motion.div
                        key={llm}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="group/chip text-12 relative overflow-hidden rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-medium text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      >
                        <div className="bg-main absolute inset-0 opacity-0 transition-opacity group-hover/chip:opacity-10" />
                        {llm}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="group relative overflow-hidden border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent transition-all hover:border-white/10">
                <div className="from-green/5 to-yellow/5 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100" />
                <CardTitle className="flex items-center justify-between">
                  <span className="text-12 text-white/50">Supported Platforms</span>
                  <span className="bg-main text-10 rounded-full bg-clip-text px-2 py-0.5 font-bold text-transparent">
                    {supportedPlatforms.length}
                  </span>
                </CardTitle>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {supportedPlatforms.map((platform, index) => (
                      <motion.div
                        key={platform}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="group/chip text-12 relative overflow-hidden rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-medium text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      >
                        <div className="bg-main absolute inset-0 opacity-0 transition-opacity group-hover/chip:opacity-10" />
                        {platform}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
