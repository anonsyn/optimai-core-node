import Token from '@/components/branding/token'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/mining'
import { formatNumber } from '@/utils/number'
import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

export const LeftPanel = () => {
  const { data: stats } = useGetMiningStatsQuery()

  // Data distribution values are already percentages from the backend
  const dataDistribution = stats?.data_distribution || { video: 0, text: 0, image: 0, audio: 0 }
  const hasAnyData = Object.values(dataDistribution).some((value) => value > 0)

  const supportedLLMs = [
    'LLama 3.2 Vision',
    'Mistral',
    'LLama 3.3',
    'Phi 4',
    'Neural Chat',
    'Gemma 2'
  ]

  const handleDashboardClick = () => {
    window.open('https://app.optimai.xyz/dashboard', '_blank')
  }

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
              <span className="flex items-center gap-2 font-semibold text-black">
                Go to Dashboard
                <ExternalLink className="size-4" />
              </span>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Rewards Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                  <CardTitle>Total Rewards</CardTitle>
                  <CardContent className="items-start">
                    <div className="flex items-center gap-2">
                      <Token className="size-5" />
                      <span className="text-24 font-bold text-white">
                        {formatNumber(stats?.total_rewards.amount || 0, {
                          minimumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Rank Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                  <CardTitle>Weekly Rank</CardTitle>
                  <CardContent className="items-start">
                    <div className="flex items-baseline gap-2">
                      <span className="text-24 font-bold text-white">
                        #{stats?.weekly_rank.current || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Data Points and Storage */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                  <CardTitle>Data Points</CardTitle>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-24 font-bold text-white">
                        {formatNumber(stats?.data_points || 0)}
                      </span>
                      <span className="text-11 text-white/30">collected</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                  <CardTitle>Data Storage</CardTitle>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-24 font-bold text-white">
                        {formatNumber(stats?.data_storage || 0)}
                      </span>
                      <span className="text-11 text-white/30">MB</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Data Distribution */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                <CardTitle>Data Distribution</CardTitle>
                <CardContent>
                  <div className="space-y-2">
                    {hasAnyData ? (
                      <>
                        {/* Video */}
                        {dataDistribution.video > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-12 text-white/60">Video</span>
                            <span className="text-12 font-medium text-white">
                              {Math.round(dataDistribution.video)}%
                            </span>
                          </div>
                        )}
                        {/* Text */}
                        {dataDistribution.text > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-12 text-white/60">Text</span>
                            <span className="text-12 font-medium text-white">
                              {Math.round(dataDistribution.text)}%
                            </span>
                          </div>
                        )}
                        {/* Image */}
                        {dataDistribution.image > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-12 text-white/60">Image</span>
                            <span className="text-12 font-medium text-white">
                              {Math.round(dataDistribution.image)}%
                            </span>
                          </div>
                        )}
                        {/* Audio */}
                        {dataDistribution.audio > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-12 text-white/60">Audio</span>
                            <span className="text-12 font-medium text-white">
                              {Math.round(dataDistribution.audio)}%
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-2 text-center">
                        <span className="text-11 text-white/40">No data collected yet</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Supported LLMs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-11 font-medium text-white/40">Supported LLMs</span>
                  <span className="text-10 rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/60">
                    {supportedLLMs.length} models
                  </span>
                </CardTitle>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {supportedLLMs.map((llm, index) => (
                      <motion.div
                        key={llm}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.03 }}
                        className="text-11 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1 text-white/70"
                      >
                        {llm}
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
