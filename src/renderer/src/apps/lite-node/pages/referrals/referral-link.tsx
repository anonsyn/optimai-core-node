import { CopyButton } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetReferralStatsQuery } from '@/queries/referral'
import { EXTERNAL_LINKS } from '@lite-node/routers/paths'
import truncateMiddle from 'truncate-middle'

const ReferralLink = () => {
  const { data, isLoading } = useGetReferralStatsQuery()

  const ref = data?.stats.referral_code || ''

  const refLink = `${EXTERNAL_LINKS.DASHBOARD.REGISTER}?ref=${ref}`

  return (
    <div className="h-[62px]">
      {isLoading ? (
        <Skeleton className="size-full" />
      ) : (
        <>
          <p className="text-12 leading-normal text-white/50">
            Share your referral link with friends and earn more rewards!
          </p>
          <div className="bg-accent/80 mt-1 flex h-10 w-full items-center justify-between rounded-lg px-4">
            <p className="text-14 leading-20 font-medium">
              {truncateMiddle(refLink, 15, 13, '...')}
            </p>
            <CopyButton className="size-4 p-0" textToCopy={refLink} iconClassName="size-4" />
          </div>
        </>
      )}
    </div>
  )
}

export default ReferralLink
