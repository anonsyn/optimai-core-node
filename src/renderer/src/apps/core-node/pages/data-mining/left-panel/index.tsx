import Token from '@/components/branding/token'
import { Badge } from '@/components/ui/badge'
import { Button, SecondaryText } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/ipc'
import { formatNumber, withSign } from '@/utils/number'
import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
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
    <div className="h-full w-[480px] bg-[#1E2221] backdrop-blur-xl">
      <ScrollArea className="h-full w-full space-y-5">
        <div className="p-5">
          <div>
            <h1 className="text-24 leading-normal font-semibold text-white">Data Mining DAO</h1>
            <p className="text-16 mt-4 leading-normal text-white/80">
              Powered by LLM, this agent automatically crawls, analyzes, and validates data for
              instant insights. Powered by LLM, this agent automatically crawls, analyzes, and
              validates data for instant insights.
            </p>
            <Button className="mt-3 w-full" variant="secondary">
              <SecondaryText>View Subscribed Data DAO</SecondaryText>
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {firstRow.map((item, index) => {
                return (
                  <Card key={index} className="gap-4">
                    <CardTitle>{item.title}</CardTitle>
                    <CardContent className="items-start">
                      <Badge className="gap-1" autoVariant={item.change}>
                        {!item.token && <TrendingUp className="size-3" />}{' '}
                        {item.changeDisplay || withSign(item.change)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {item.token && <Token className="size-7" />}
                        <span className="text-32 font-bold">{item.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondRow.map((item, index) => {
                return (
                  <Card key={index}>
                    <CardTitle>{item.title}</CardTitle>
                    <CardContent>
                      <span className="text-32 font-bold">{item.value}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardTitle>Supported LLMs ({supportedLLMs.length})</CardTitle>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {supportedLLMs.map((llm) => (
                    <div
                      key={llm}
                      className="bg-accent/40 flex items-center justify-center rounded-[40px] border border-white/4 px-5 py-2 text-base leading-normal font-normal text-white"
                    >
                      {llm}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardTitle>Supported Platforms ({supportedPlatforms.length})</CardTitle>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {supportedPlatforms.map((platform) => (
                    <div
                      key={platform}
                      className="bg-accent/40 flex items-center justify-center rounded-[40px] border border-white/4 px-5 py-2 text-base leading-normal font-normal text-white"
                    >
                      {platform}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
