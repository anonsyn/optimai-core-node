import Logo from '@/components/branding/logo'
import { WindowControlButton, WindowControls } from '@/components/modules/window-controls'
import { getOS, OS } from '@/utils/os'
import { motion } from 'framer-motion'
import { AssignmentsList } from './assignments'
import { LeftPanel } from './left-panel'

const DataMiningPage = () => {
  const os = getOS()
  const isMac = os === OS.MAC

  return (
    <div className="bg-background relative flex h-full flex-col overflow-hidden">
      {/* Header with Logo and Window Controls */}
      <div className="relative z-40 flex h-12 items-center justify-between border-b border-white/5">
        <div className="drag-region absolute inset-0" />

        {/* Logo - positioned after traffic lights on macOS */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="no-drag relative z-10 flex items-center"
          style={{
            paddingLeft: isMac ? '85px' : '20px' // Space for traffic lights on macOS
          }}
        >
          <Logo variant="horizontal" className="h-5 w-auto" />
        </motion.div>

        <WindowControls className="no-drag relative pr-4">
          <WindowControlButton variant="minimize" />
          <WindowControlButton variant="maximize" />
          <WindowControlButton variant="close" />
        </WindowControls>
      </div>

      {/* Main Content Area */}
      <div className="relative flex h-[calc(100%-3rem)] overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-[100px] -left-[200px] h-[600px] w-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(246, 246, 85, 0.3) 0%, transparent 70%)'
            }}
          />
          <div
            className="absolute -right-[200px] bottom-[100px] h-[600px] w-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(94, 237, 135, 0.3) 0%, transparent 70%)'
            }}
          />
        </div>

        {/* Panels */}
        <LeftPanel />
        <AssignmentsList />
      </div>
    </div>
  )
}

export default DataMiningPage
