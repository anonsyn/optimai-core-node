import { useHeader } from '@/hooks/use-header'
import ReferralLink from './referral-link'
import ReferralTabs from './tabs'

const ReferralsPage = () => {
  useHeader({ title: 'Referrals' })

  return (
    <div className="relative h-full" data-global-glow="false">
      <div className="hide-scrollbar h-full overflow-y-auto">
        <div className="container pt-4">
          <ReferralLink />
          <ReferralTabs />
        </div>
      </div>
    </div>
  )
}

export default ReferralsPage
