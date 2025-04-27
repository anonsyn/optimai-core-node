import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAppSelector } from '@/hooks/redux'
import { authSelectors } from '@/store/slices/auth'

interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {}

const UserAvatar = ({ className, ...props }: UserAvatarProps) => {
  const username = useAppSelector(authSelectors.username) || 'A'

  return (
    <Avatar className={className} {...props}>
      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar
