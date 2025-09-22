import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { useCloseModal, useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { useState } from 'react'

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)
  const [isChecking, setIsChecking] = useState(false)
  const closeModal = useCloseModal(Modals.DOCKER_NOT_RUNNING)

  const handleRetry = async () => {
    setIsChecking(true)
  }

  const handleQuit = () => {
    window.windowIPC.close()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) return
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Docker Desktop Not Running</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <p>Docker Desktop is installed but not currently running.</p>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>Open Docker Desktop application</li>
                <li>Wait for Docker to fully start (icon in system tray)</li>
                <li>Click &quot;Retry&quot; below when Docker is running</li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8 sm:justify-between">
          <Button onClick={handleRetry} disabled={isChecking}>
            <Icon icon="RotateCcw" className="mr-2 h-4 w-4" />
            <span>Retry</span>
          </Button>
          <Button variant="outline" onClick={handleQuit}>
            Quit App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
