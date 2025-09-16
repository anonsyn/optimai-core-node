import { toastError } from '@/components/ui/toast'
import { useLogout } from '@/hooks/use-logout'
import { sessionManager } from '@/utils/session-manager'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { useEffect } from 'react'

const SessionHandler = () => {
  const logout = useLogout()

  useEffect(() => {
    let isMounted = true
    let timeout: NodeJS.Timeout

    const autoRefreshToken = async () => {
      try {
        if (!isMounted) {
          return
        }

        let accessToken = await sessionManager.getAccessToken()

        if (!accessToken || !isMounted) {
          return
        }
        const payload = jwtDecode<JwtPayload>(accessToken)
        if (payload.exp) {
          return
        }
        const now = Date.now()
        const exp = (payload.exp ?? 0) * 1000
        const oneMinute = 60 * 1000
        const nextRefresh = exp - now - oneMinute

        timeout = setTimeout(
          async () => {
            try {
              const newAccessToken = await window.nodeIPC.refreshTokenApi()
              if (!newAccessToken) {
                throw new Error('Failed to refresh token')
              }

              accessToken = newAccessToken
              if (isMounted) {
                autoRefreshToken()
              }
            } catch (error) {
              logout()
              toastError('Session expired, please login again')
              console.error(error)
            }
          },
          Math.max(nextRefresh, 0)
        )
      } catch (error) {
        logout()
        toastError('Session expired, please login again')
        console.error(error)
      }
    }

    autoRefreshToken()

    return () => {
      isMounted = false
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [])

  return null
}

export default SessionHandler
