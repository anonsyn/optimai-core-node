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
import { useLogout } from '@/hooks/use-logout'
import { Modals } from '@/store/slices/modals'
import { useState } from 'react'

export function LogoutConfirmationModal() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const open = useIsModalOpen(Modals.LOGOUT_CONFIRMATION)

  const closeModal = useCloseModal(Modals.LOGOUT_CONFIRMATION)

  const handleCloseModal = () => {
    if (isLoggingOut) {
      return
    }
    closeModal()
  }

  const logout = useLogout()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    closeModal()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleCloseModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logging out</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to proceed?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
            Confirm
          </AlertDialogAction>
          <AlertDialogCancel disabled={isLoggingOut}>
            <SecondaryText>Cancel</SecondaryText>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
