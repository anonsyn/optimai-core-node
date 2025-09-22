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
import { useIsModalOpen, useModalData } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { cn } from '@/utils/tw'
import { useState } from 'react'

export function DockerNotInstalledModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_INSTALLED)
  const data = useModalData(Modals.DOCKER_NOT_INSTALLED)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const handleInstallDocker = async () => {
    setIsInstalling(true)
    try {
      await window.dockerIPC.openInstallGuide()
    } catch (error) {
      console.error('Failed to open Docker installation guide:', error)
      window.windowIPC.openExternalLink('https://www.docker.com/products/docker-desktop/')
    }
  }

  const handleRetry = async () => {
    if (!data?.onRetry) {
      return
    }

    setIsChecking(true)
    try {
      await data.onRetry()
    } catch (error) {
      console.error('Failed to retry Docker installation check:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleQuit = () => {
    window.windowIPC.close()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsInstalling(false)
      setIsChecking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Docker Desktop Required</DialogTitle>
          <DialogDescription>
            Docker Desktop is required to run the OptimAI Core Node. Please install Docker Desktop
            to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8 sm:justify-between">
          {!isInstalling ? (
            <>
              <Button onClick={handleInstallDocker}>
                <Icon icon="Globe" className="mr-2 h-4 w-4" />
                Install Docker
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleRetry} disabled={isChecking}>
                <Icon
                  icon="RotateCcw"
                  className={cn('block h-4 w-4', isChecking && 'animate-spin duration-500')}
                />
                <span>Check Docker</span>
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleQuit}>
            Quit App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
