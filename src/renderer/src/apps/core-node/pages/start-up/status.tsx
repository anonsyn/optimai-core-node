import { useOpenModal } from '@/hooks/modal'
import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { authActions } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
import { sessionManager } from '@/utils/session-manager'
import { sleep } from '@/utils/sleep'
import { cn } from '@/utils/tw'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { HTMLAttributes, useEffect, useState } from 'react'

interface StatusProps extends HTMLAttributes<HTMLDivElement> {}

const Status = ({ className, ...props }: StatusProps) => {
  const [statuses, setStatuses] = useState<{ message: string; error?: boolean }[]>([
    { message: 'Initializing...' }
  ])

  const [listRef] = useAutoAnimate()

  const dispatch = useAppDispatch()

  const getCurrentUserQuery = useGetCurrentUserQuery({
    enabled: false,
    retry: false
  })

  const openLoginModal = useOpenModal(Modals.LOGIN)

  useEffect(() => {
    const checkForUpdates = async () => {
      return new Promise<boolean>((resolve) => {
        setStatuses((prev) => [...prev, { message: 'Checking for updates...' }])

        window.updaterIPC.onStateChange((state) => {
          if (state.status === 'checking') {
            setStatuses((prev) => [...prev, { message: 'Checking for updates...' }])
            return
          }

          if (state.status === 'downloading') {
            setStatuses((prev) => [...prev, { message: 'Downloading update...' }])
            return
          }

          if (state.status === 'idle' || state.status === 'error') {
            resolve(false)
            return
          }

          if (state.status === 'downloaded') {
            setStatuses((prev) => [...prev, { message: 'Restarting Node...' }])
            resolve(true)
            return
          }
        })
        window.updaterIPC.checkForUpdateAndNotify()
      })
    }

    const checkAuth = async () => {
      setStatuses((prev) => [...prev, { message: 'Checking authentication...' }])
      try {
        const accessToken = await sessionManager.getAccessToken()

        if (!accessToken) {
          throw new Error('No access token found')
        }

        const res = await getCurrentUserQuery.refetch({
          throwOnError: true
        })

        const user = res.data?.user
        console.log({ user })

        if (!user) {
          throw new Error('No user found')
        }

        dispatch(authActions.setUser(user))
        return true
      } catch {
        return false
      }
    }

    const startNode = async () => {
      try {
        setStatuses((prev) => [...prev, { message: 'Starting Node...' }])
        await window.nodeIPC.startNode()
        console.log('Node started')
      } catch (error) {
        console.log('Error starting node')
        console.error(error)
        setStatuses((prev) => [
          ...prev,
          { message: 'Starting node failed, please restart the application', error: true }
        ])
      }
    }

    const startApplication = async () => {
      // Wait for animation to complete
      await sleep(3000)

      const shouldRestart = await checkForUpdates()

      await sleep(1000)

      if (shouldRestart) {
        window.updaterIPC.quitAndInstall()
        return
      }

      const isAuthenticated = await checkAuth()

      if (!isAuthenticated) {
        openLoginModal({
          onSuccess: () => {
            startNode()
          }
        })
        return
      }

      startNode()
    }

    startApplication()

    return () => {}
  }, [])

  console.log({ statuses })

  return (
    <div className={cn('relative h-full w-full overflow-visible', className)} {...props}>
      <div
        ref={listRef}
        className="absolute inset-x-0 bottom-0 flex h-[108px] w-full flex-col justify-end overflow-visible"
        style={{
          maskImage: 'linear-gradient(180deg, rgba(217, 217, 217, 0.00) 0%, #737373 100%)'
        }}
      >
        {statuses.map((status) => {
          return (
            <p
              key={status.message}
              className={cn(
                'text-24 shrink-0 text-center leading-normal font-medium text-white',
                status.error && 'text-destructive'
              )}
              style={{
                textShadow: '0px 0px 12px rgba(255, 255, 255, 0.30)'
              }}
            >{`> ${status.message}`}</p>
          )
        })}
      </div>
    </div>
  )
}

export default Status
