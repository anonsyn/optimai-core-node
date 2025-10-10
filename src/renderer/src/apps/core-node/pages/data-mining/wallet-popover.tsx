import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button/button'
import { CopyButton } from '@/components/ui/button/copy-button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { authSelectors } from '@/store/slices/auth'
import { Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDebounce } from 'use-debounce'

const formatJoinedDate = (isoDate?: string) => {
  if (!isoDate) {
    return undefined
  }

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const WalletPopover = () => {
  const [open, setOpen] = useState(false)
  const [debouncedOpen] = useDebounce(open, 100)

  const user = useSelector(authSelectors.user)

  const walletAddress = user?.wallet_address

  const handleMouseEnter = () => {
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  const truncatedAddress = useMemo(() => {
    if (!walletAddress) {
      return undefined
    }

    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
  }, [walletAddress])

  const initials = useMemo(() => {
    const source = user?.display_name?.trim() || user?.email?.trim() || walletAddress || ''

    if (!source) {
      return 'OP'
    }

    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [user?.display_name, user?.email, walletAddress])

  const joinedLabel = useMemo(() => formatJoinedDate(user?.joined_at), [user?.joined_at])

  if (!user) {
    return null
  }

  return (
    <Popover open={debouncedOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button
          type="button"
          className="bg-accent/30 hover:bg-accent/40 text-13 flex items-center gap-2 rounded-xl border border-white/5 px-4 py-1.5 transition-colors outline-none"
        >
          <Wallet className="size-4 text-white/70" />
          <span className="font-medium text-white">{truncatedAddress || 'Connect Wallet'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background w-[340px] overflow-hidden border-white/5 p-0 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        align="end"
        sideOffset={12}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header Section */}
        <div className="bg-accent/50 p-4">
          <div className="relative">
            <div className="flex items-center gap-3">
              <Avatar className="bg-raydial-10 size-12 border border-white/10">
                <AvatarFallback className="text-15 bg-transparent font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-16 truncate font-semibold text-white">
                  {user?.display_name || 'OptimAI Operator'}
                </p>
                <p className="text-14 truncate text-white/60">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Social Connections */}
          <div className="mt-3 flex items-center gap-2">
            {user?.twitter && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2 py-1">
                <Icon icon="Twitter" className="size-3 text-white/60" />
                <span className="text-12 text-white/60">@{user.twitter.username}</span>
              </div>
            )}
            {user?.telegram && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2 py-1">
                <Icon icon="Telegram" className="size-3 text-white/60" />
                <span className="text-12 text-white/60">{user.telegram.first_name}</span>
              </div>
            )}
            {!user?.twitter && !user?.telegram && (
              <span className="text-12 text-white/60">No social accounts connected</span>
            )}
          </div>
        </div>

        <div className="relative space-y-4 p-4">
          {/* Wallet Section */}
          <div>
            <div className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-white/5 to-white/3 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/5">
                  <Wallet className="size-4 text-white/60" />
                </div>
                <div className="min-w-0 flex-1">
                  {walletAddress ? (
                    <>
                      <p className="text-12 text-white/60">Address</p>
                      <p className="text-14 truncate font-mono font-medium text-white">
                        {truncatedAddress}
                      </p>
                    </>
                  ) : (
                    <p className="text-14 text-white/60">No wallet connected</p>
                  )}
                </div>
                {walletAddress && (
                  <CopyButton
                    textToCopy={walletAddress}
                    className="text-white/60 transition-colors hover:text-white/80"
                    iconClassName="size-4"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div>
            <div className="rounded-lg bg-gradient-to-r from-white/5 to-white/3 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-white/5">
                  <Icon icon="Calendar" className="size-4 text-white/60" />
                </div>
                <div className="flex-1">
                  <p className="text-12 text-white/60">Member Since</p>
                  <p className="text-14 font-medium text-white">{joinedLabel || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => window.windowIPC.openExternalLink('https://optimai.xyz/dashboard')}
              >
                View Dashboard
              </Button>
              {!walletAddress && (
                <button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-12 flex-1 rounded-lg px-3 py-2.5 font-medium transition-all"
                  onClick={() => window.windowIPC.openExternalLink('https://optimai.xyz/wallet')}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
