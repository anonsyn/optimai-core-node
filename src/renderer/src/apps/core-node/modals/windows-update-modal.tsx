import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'

const DOWNLOAD_BASE_URL = 'https://core-node.optimai.network'

export function WindowsUpdateModal() {
  const open = useIsModalOpen(Modals.WINDOWS_UPDATE_AVAILABLE)

  return (
    <Dialog open={open}>
      <DialogContent
        className="overflow-hidden sm:max-w-[452px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <WindowsUpdateContent />
      </DialogContent>
    </Dialog>
  )
}

const WindowsUpdateContent = () => {
  const { version } = useModalData(Modals.WINDOWS_UPDATE_AVAILABLE) || {}

  const handleDownload = () => {
    // Construct the download URL based on version
    const downloadUrl = `${DOWNLOAD_BASE_URL}/optimai-corenode-${version}-setup.exe`

    // Open the download URL in default browser
    window.windowIPC.openExternalLink(downloadUrl)
  }

  return (
    <div className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 text-center"
      >
        <div className="bg-background relative mx-auto mb-4 flex size-18 items-center justify-center rounded-full">
          <div className="bg-secondary relative z-10 flex size-11 items-center justify-center rounded-full">
            <Download className="size-6 text-white" />
          </div>

          {/* Animated circles */}
          <div className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 size-1.5"
                style={{
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: [i * 120, i * 120 + 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                <div
                  className="size-1.5 -translate-x-1/2 -translate-y-8 rounded-full"
                  style={{
                    background: i === 0 ? '#f6f655' : i === 1 ? '#a6ed6e' : '#5eed87'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <h3 className="text-20 font-semibold text-white">
          New Update Available {version && `- v${version}`}
        </h3>
        <p className="text-16 mt-1 text-balance text-white/50">
          A new version is ready to download. Please download and install the latest version to
          continue enjoying the best experience
        </p>
      </motion.div>

      <div className="space-y-2 pt-15">
        <Button className="w-full" onClick={handleDownload}>
          Download Update
        </Button>
        <div className="text-14 text-center text-white/50">
          After downloading, close this app and run the installer
        </div>
      </div>
    </div>
  )
}

export default WindowsUpdateModal
