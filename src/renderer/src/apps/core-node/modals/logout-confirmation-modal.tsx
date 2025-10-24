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
import { useLogout } from '@/hooks/use-logout'
import { Modals } from '@/store/slices/modals'

export function LogoutConfirmationModal() {
  const open = useIsModalOpen(Modals.LOGOUT_CONFIRMATION)
  const closeModal = useCloseModal(Modals.LOGOUT_CONFIRMATION)
  const logout = useLogout()

  const handleLogout = async () => {
    await logout()
    closeModal()
  }

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logging out</AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            Are you sure you want to proceed? This will stop the node and sign you out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleLogout}>Confirm</AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
