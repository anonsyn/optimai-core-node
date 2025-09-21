import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useCloseModal, useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'

export function DockerNotRunningModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_RUNNING)
  const closeModal = useCloseModal(Modals.DOCKER_NOT_RUNNING)

  const handleRetry = async () => {
    closeModal()
    // The retry logic will be handled by the StartupProvider
  }

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Docker Desktop Not Running</AlertDialogTitle>
          <AlertDialogDescription>
            Docker Desktop is installed but not currently running. Please start Docker Desktop and
            try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction onClick={handleRetry}>Retry</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}