import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { authActions } from '@/store/slices/auth'
import { AssignmentDetailModal } from '@core-node/modals/assignment-detail-modal'
import { LogoutConfirmationModal } from '@core-node/modals/logout-confirmation-modal'
import { MiningErrorModal } from '@core-node/modals/mining-error-modal'
import { MiningStoppedModal } from '@core-node/modals/mining-stopped-modal'
import { useEffect } from 'react'
import { DataMiningHeader } from './header'
import { LeftPanel } from './left-panel'
import { Mining } from './mining'

const DataMiningPage = () => {
  const { data } = useGetCurrentUserQuery()
  const user = data?.user

  const dispatch = useAppDispatch()
  useEffect(() => {
    if (user) {
      dispatch(authActions.setUser(user))
    }
  }, [dispatch, user])

  console.log({ user })
  return (
    <div className="bg-background relative flex h-full flex-col overflow-hidden">
      {/* Header with Logo and Window Controls */}
      <DataMiningHeader />

      {/* Main Content Area */}
      <div className="relative flex h-[calc(100%-3rem)] overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-[100px] -left-[200px] h-[600px] w-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(246, 246, 85, 0.3) 0%, transparent 70%)'
            }}
          />
          <div
            className="absolute -right-[200px] bottom-[100px] h-[600px] w-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(94, 237, 135, 0.3) 0%, transparent 70%)'
            }}
          />
        </div>

        {/* Panels */}
        <LeftPanel />
        <Mining />
      </div>

      {/* Modals */}
      <AssignmentDetailModal />
      <MiningStoppedModal />
      <MiningErrorModal />
      <LogoutConfirmationModal />
    </div>
  )
}

export default DataMiningPage
