import { ScrollArea } from '@/components/ui/scroll-area'
import { DeviceInfoCard } from './device-info-card'
import { TotalRewardsCard } from './total-rewards-card'

export const LeftPanel = () => {
  return (
    <div className="bg-background relative h-full w-[456px] flex-shrink-0 border-r border-white/5">
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col items-start gap-3 p-5">
          {/* Total Rewards with World Map */}
          <TotalRewardsCard />

          {/* Device Information */}
          <DeviceInfoCard />
        </div>
      </ScrollArea>
    </div>
  )
}
