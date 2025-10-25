import { HelpMenuContent } from '@/components/help-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { IconButton } from '@/components/ui/button'
import { Button } from '@/components/ui/button/button'
import { CopyButton } from '@/components/ui/button/copy-button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EXTERNAL_LINKS } from '@/configs/links'
import { useOpenModal } from '@/hooks/modal'
import { authSelectors } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
import { LogOut, Wallet, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

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
  const [openMenu, setOpenMenu] = useState(false)

  const handleOpenPopoverChange = (value: boolean) => {
    if (openMenu) {
      return
    }

    setOpen(value)
  }

  const user = useSelector(authSelectors.user)
  const openLogoutModal = useOpenModal(Modals.LOGOUT_CONFIRMATION)

  const walletAddress = user?.wallet_address

  const handleLogout = () => {
    setOpen(false)
    openLogoutModal()
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
    <Popover open={open} onOpenChange={handleOpenPopoverChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="bg-accent/30 hover:bg-accent/40 text-16 flex h-10 items-center gap-2 rounded-xl border border-white/5 px-4 transition-colors outline-none"
        >
          <Wallet className="size-4.5 text-white" />
          <span className="font-medium text-white">{truncatedAddress || 'Connect Wallet'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background w-[480px] overflow-hidden border-white/5 p-0 shadow-[0_4px_4px_12px_rgba(0,0,0,0.1)]"
        align="end"
        sideOffset={12}
      >
        <div
          className="bg-secondary/50 relative p-4"
          style={{
            backgroundImage: 'linear-gradient(0deg, #222623 0%, #222623 100%)'
          }}
        >
          <div>
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border border-white/5 bg-[#2D302D]">
                <AvatarFallback className="text-20 bg-transparent font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-18 truncate font-semibold text-white">
                  {user?.display_name || 'OptimAI Operator'}
                </p>
                <p className="text-14 truncate text-white/50">{user?.email}</p>
              </div>
            </div>
          </div>
          {/* Social Connections */}
          {Boolean(user?.twitter || user?.telegram) && (
            <div className="mt-5 flex items-center gap-2">
              {user?.twitter && (
                <div className="bg-background flex h-10 items-center justify-center gap-2 rounded-full border border-white/5 px-4">
                  <Icon icon="Twitter" className="size-4.5 text-white" />
                  <span className="text-16 font-medium text-white/60">
                    @{user.twitter.username}
                  </span>
                </div>
              )}
              {user?.telegram && (
                <div className="bg-background flex h-10 items-center justify-center gap-2 rounded-full border border-white/5 px-4">
                  <Icon icon="Telegram" className="size-4.5 text-white" />
                  <span className="text-16 font-medium text-white/60">
                    {user.telegram.first_name}
                  </span>
                </div>
              )}
            </div>
          )}
          <IconButton
            className="absolute top-4 right-4 size-10 rounded-lg"
            onClick={setOpen.bind(this, false)}
          >
            <X className="size-6" />
          </IconButton>
        </div>

        <div className="relative p-5">
          <div className="space-y-2">
            <div className="bg-secondary/50 flex h-11 items-center gap-2.5 rounded-lg pr-4 pl-3">
              <Wallet className="size-4.5 text-white" />
              <p className="text-14 flex-1 leading-normal font-medium">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="text-14 leading-normal font-medium text-white/50">
                  {truncatedAddress}
                </p>
                {walletAddress && <CopyButton textToCopy={walletAddress} iconClassName="size-4" />}
              </div>
            </div>

            <div className="bg-secondary/50 flex h-11 items-center gap-2.5 rounded-lg pr-4 pl-3">
              <Icon className="size-4.5 text-white" icon="Calendar" />
              <p className="text-14 flex-1 leading-normal font-medium">Member Since</p>
              <p className="text-14 leading-normal font-medium text-white/50">
                {joinedLabel || '--'}
              </p>
            </div>

            <div className="bg-secondary/50 flex h-11 items-center gap-2.5 rounded-lg pr-4 pl-3">
              <Icon className="size-4.5 text-white" icon="Calendar" />
              <p className="text-14 flex-1 leading-normal font-medium">Help Menu</p>
              <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-14 flex items-center gap-1 leading-normal font-medium text-white/50 hover:text-white/80"
                    type="button"
                  >
                    <span>See all</span>
                    <Icon className="size-4" icon="ChevronRight" />
                  </button>
                </DropdownMenuTrigger>
                <HelpMenuContent />
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-3 pt-12">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.HOME)}
            >
              View Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
