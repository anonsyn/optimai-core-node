import Token from '@/components/branding/token'
import AvatarPlaceholder from '@/components/svgs/avatar-placeholder'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import IMAGES from '@/configs/images'
import { useGetReferralListQuery } from '@/queries/referral'
import { Referral } from '@/services/referral'
import { cn } from '@/utils/tw'

const Friends = () => {
  const { data, isLoading } = useGetReferralListQuery({
    platforms: 'tlg'
  })

  const friends = data?.data.items || []

  const displayFriends = friends.filter((item) => item.completed)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-11 w-1/2" />
        <Skeleton className="h-11 w-3/4" />
        <Skeleton className="h-11 w-full" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className={cn('space-y-6', displayFriends.length !== 0 && 'pb-2')}>
        {displayFriends.length === 0 ? (
          <Empty />
        ) : (
          <>
            {displayFriends.map((item, index) => {
              return <FriendItem key={index} item={item} />
            })}
          </>
        )}
      </div>
    </div>
  )
}

const Empty = () => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-2.5 py-3 pt-1 duration-300">
      <img className="size-34" src={IMAGES.SITES.NO_REFS} alt="No Referrals" />
      <p className="text-12 max-w-[19.25rem] pb-1 text-center leading-normal font-medium text-white/50">
        Uh-oh, looks like you have no friends yet! Let&apos;s fix that start earning together!
        <br />
      </p>
    </div>
  )
}

const FriendItem = ({ item }: { item: Referral }) => {
  const name = item.username || item.email

  return (
    <div className="flex items-start gap-2">
      <Avatar className="size-6 p-0">
        <AvatarImage src={item.photo_url} alt={name} />
        <AvatarFallback>
          <AvatarPlaceholder className="size-full" />
        </AvatarFallback>
      </Avatar>

      <span className="text-16 block leading-normal font-medium text-white">{name}</span>
      <div className="ml-auto flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1">
          <span className="text-16 block leading-normal font-medium text-white">
            +{item.rewards}
          </span>
          <Token className="size-4.5" />
        </div>
      </div>
    </div>
  )
}

export default Friends
