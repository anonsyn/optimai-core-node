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
import { EXTERNAL_LINKS } from '@lite-node/routers/paths'

function DashboardMissionModal() {
  const open = useIsModalOpen(Modals.DASHBOARD_MISSION)

  const closeModal = useCloseModal(Modals.DASHBOARD_MISSION)

  const handleLogout = () => {
    window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.HOME)
  }

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dashboard Only</AlertDialogTitle>
          <AlertDialogDescription>
            This mission is only available on the dashboard. Do you want to open it now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogAction onClick={handleLogout}>Open Dashboard</AlertDialogAction>
          <AlertDialogCancel>
            <SecondaryText>Close</SecondaryText>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DashboardMissionModal
