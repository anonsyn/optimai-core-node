import { sessionManager } from '@/utils/session-manager'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { useEffect } from 'react'

const SessionHandler = () => {
  useEffect(() => {
    let isMounted = true
    let timeout: NodeJS.Timeout

    const autoRefreshToken = async () => {
      let accessToken = await sessionManager.getAccessToken()

      if (!accessToken || isMounted) {
        return
      }

      try {
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
            const res = await window.authIPC.refreshToken()
            if (res && res.access_token) {
              accessToken = res.access_token
              autoRefreshToken()
            }
          },
          Math.max(nextRefresh, 0)
        )
      } catch (error) {
        console.log('AUTO REFRESH TOKEN ERROR', error)
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
