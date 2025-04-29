import { useAppDispatch } from '@/hooks/redux'
import { onlineActions } from '@/store/slices/online'
import isOnline from 'is-online'
import pRetry from 'p-retry'
import { PropsWithChildren, useEffect } from 'react'

const OnlineProvider = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    let mounted = true

    const checkOnline = async () => {
      const online = await pRetry(() => isOnline(), {
        retries: 2,
        minTimeout: 3000
      })
      dispatch(onlineActions.setIsOnline(online))
      if (mounted) {
        id = setTimeout(checkOnline, 1000 * 20)
      }
    }

    checkOnline()

    return () => {
      mounted = false
      if (id) {
        clearTimeout(id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export default OnlineProvider
