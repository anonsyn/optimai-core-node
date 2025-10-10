import Logo from '@/components/branding/logo'
import { WindowControlButton, WindowControls } from '@/components/modules/window-controls'
import { authSelectors } from '@/store/slices/auth'
import { getOS, OS } from '@/utils/os'
import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { useSelector } from 'react-redux'
import packageJson from '../../../../../../../package.json'

export const DataMiningHeader = () => {
  const os = getOS()
  const isMac = os === OS.MAC
  const walletAddress = useSelector(authSelectors.userAddress)

  return (
    <div className="relative z-40 flex h-13 items-center justify-between border-b border-white/5">
      <div className="drag-region absolute inset-0" />

      {/* Logo - positioned after traffic lights on macOS */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="no-drag relative z-10 flex items-center gap-2"
        style={{
          paddingLeft: isMac ? '85px' : '20px' // Space for traffic lights on macOS
        }}
      >
        <Logo variant="horizontal" className="h-5 w-auto" />
        <span className="self-end font-mono text-[8px] text-white/40">v{packageJson.version}</span>
      </motion.div>

      <div className="no-drag relative z-10 flex items-center gap-3 pr-4">
        {walletAddress && (
          <div className="bg-secondary/50 flex items-center gap-2 rounded-2xl px-4 py-1.5">
            <Wallet className="size-4 text-white/60" />
            <span className="text-13 font-mono text-white/60">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}
        <WindowControls className="!static flex items-center">
          <WindowControlButton variant="minimize" />
          <WindowControlButton variant="maximize" />
          <WindowControlButton variant="close" />
        </WindowControls>
      </div>
    </div>
  )
}
