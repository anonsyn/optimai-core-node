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

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)
  const data = useModalData(Modals.DOCKER_NOT_RUNNING)
  const [isChecking, setIsChecking] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  const handleRetry = async () => {
    if (!data?.onRetry) {
      return
    }

    setRetryError(null)
    setIsChecking(true)
    try {
      const success = await data.onRetry()
      if (!success) {
        setRetryError('Docker Desktop is still starting. Wait for Docker to finish launching and retry.')
      } else {
        setRetryError(null)
      }
    } catch (error) {
      console.error('Failed to retry Docker runtime check:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleQuit = () => {
    window.windowIPC.close()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsChecking(false)
      setRetryError(null)
    }
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
          {retryError && (
            <p className="mt-2 text-sm text-destructive" role="alert" aria-live="assertive">
              {retryError}
            </p>
          )}
        </DialogHeader>
        <DialogFooter className="mt-8 sm:justify-between">
          <Button onClick={handleRetry} disabled={isChecking}>
            <Icon
              icon="RotateCcw"
              className={cn('mr-2 h-4 w-4', isChecking && 'animate-spin duration-500')}
            />
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
