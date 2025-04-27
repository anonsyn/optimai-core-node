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
import { SecondaryText } from '@/components/ui/button'
import { useCloseModal, useIsModalOpen } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'

export function LogoutConfirmationModal() {
  const open = useIsModalOpen(Modals.LOGOUT_CONFIRMATION)

  const closeModal = useCloseModal(Modals.LOGOUT_CONFIRMATION)

  const handleLogout = () => {}

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logging out</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to proceed?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction onClick={handleLogout}>Confirm</AlertDialogAction>
          <AlertDialogCancel>
            <SecondaryText>Cancel</SecondaryText>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
