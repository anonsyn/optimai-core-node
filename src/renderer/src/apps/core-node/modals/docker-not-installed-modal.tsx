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

export function DockerNotInstalledModal() {
  const open = useIsModalOpen(Modals.DOCKER_NOT_INSTALLED)
  const closeModal = useCloseModal(Modals.DOCKER_NOT_INSTALLED)

  const handleInstallDocker = async () => {
    await window.dockerIPC.openInstallGuide()
  }

  const handleRetry = async () => {
    closeModal()
    // The retry logic will be handled by the StartupProvider
  }

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Docker Desktop Required</AlertDialogTitle>
          <AlertDialogDescription>
            Docker Desktop is required to run the OptimAI Core Node. Please install Docker Desktop
            and try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction onClick={handleInstallDocker}>Install Docker</AlertDialogAction>
          <AlertDialogCancel onClick={handleRetry}>Retry</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}