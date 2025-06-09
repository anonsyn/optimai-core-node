import Token from '@/components/branding/token'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const AccountBalance = () => {
  return (
    <div
      className="flex h-12 gap-3 overflow-hidden rounded-lg border border-[#40502D]"
      style={{
        backgroundImage:
          'linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(90deg, rgba(246, 246, 85, 0.10) 0%, rgba(94, 237, 135, 0.10) 100%)'
      }}
    >
      <div className="flex h-full items-center gap-2 pl-4">
        <Token className="size-6" />
        <span className="text-22 leading-normal font-medium">1,251.86</span>
        <span className="text-16 text-positive leading-normal font-normal">+89.48</span>
      </div>
      <Button className="no-drag aspect-square h-full min-h-0 w-auto rounded-none border-none p-0">
        <Icon className="size-6" icon="Profile" />
      </Button>
    </div>
  )
}

export default AccountBalance
