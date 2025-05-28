import { loadingLottieData } from '@/assets/lotties/loading'
import Logo from '@/components/branding/logo'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { PATHS } from '@/routers/paths'
import { authActions, authSelectors } from '@/store/slices/auth'
import { sessionManager } from '@/utils/session-manager'
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

const StartUpPage = () => {
  const [lottieRunning, setLottieRunning] = useState(true)
  const [checkingUpdate, setCheckingUpdate] = useState(true)
  const [downloadingUpdate, setDownloadingUpdate] = useState(false)
  const [installingUpdate, setInstallingUpdate] = useState(false)
  const [isNodeStarting, setIsNodeStarting] = useState(true)

  const isCheckingAuth = useAppSelector(authSelectors.isCheckingAuth)
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)

  const getCurrentUserQuery = useGetCurrentUserQuery({
    enabled: false,
    retry: false
  })

  const dispatch = useAppDispatch()

  const navigate = useNavigate()

  const canStartNode = !isCheckingAuth && !checkingUpdate && !downloadingUpdate && !installingUpdate

  const isLoading =
    isCheckingAuth ||
    lottieRunning ||
    checkingUpdate ||
    downloadingUpdate ||
    installingUpdate ||
    isNodeStarting

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = await sessionManager.getAccessToken()
        console.log(accessToken)

        if (!accessToken) {
          throw new Error('No access token found')
        }

        const res = await getCurrentUserQuery.refetch({
          throwOnError: true,
          cancelRefetch: false
        })

        const user = res.data?.user

        if (!user) {
          throw new Error('No user found')
        }

        dispatch(
          authActions.setState({
            isChecked: true,
            isChecking: false,
            user: user
          })
        )
      } catch {
        dispatch(
          authActions.setState({
            isChecked: true,
            isChecking: false,
            user: undefined
          })
        )
      }
    }
    if (isCheckingAuth) {
      console.log('Call check auth')
      checkAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth])

  useEffect(() => {
    const isDEV = import.meta.env.DEV
    const duration = isDEV ? 1000 : 6000
    const id = setTimeout(() => {
      setLottieRunning(false)
    }, duration)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const subscription = window.updaterIPC.onStateChange((state) => {
      if (state.status === 'checking') {
        setCheckingUpdate(true)
      }

      if (state.status === 'downloading') {
        setDownloadingUpdate(true)
      }

      if (state.status === 'idle' || state.status === 'error') {
        setCheckingUpdate(false)
        setDownloadingUpdate(false)
      }

      if (state.status === 'downloaded') {
        setDownloadingUpdate(false)
        setInstallingUpdate(true)
      }
    })
    const id = setTimeout(() => {
      window.updaterIPC.checkForUpdateAndNotify()
    }, 1200)

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (installingUpdate) {
      const id = setTimeout(() => {
        window.updaterIPC.quitAndInstall()
      }, 2000)
      return () => clearTimeout(id)
    }
  }, [installingUpdate])

  useEffect(() => {
    if (canStartNode) {
      if (isSignedIn) {
        const startNode = async () => {
          try {
            console.log('Start node')
            await window.nodeIPC.startNode()
            setIsNodeStarting(false)
            console.log('Node started')
          } catch (error) {
            console.log('Error starting node')
            console.error(error)
            setIsNodeStarting(false)
          }
        }
        startNode()
      } else {
        setIsNodeStarting(false)
      }
    }
  }, [canStartNode, isSignedIn])

  useEffect(() => {
    if (!isLoading) {
      const path = isSignedIn ? PATHS.HOME : PATHS.LOGIN
      navigate(path, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isSignedIn])

  return (
    <div className="absolute inset-0 size-full overflow-hidden bg-[#1E1E1E]">
      <div className="absolute inset-0">
        <div className="bg-global absolute inset-0 blur-2xl" />
        <div
          className="absolute top-1/2 right-full size-150 translate-x-30 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(47.02% 47.02% at 50% 50%, rgba(62, 251, 175, 0.05) 0%, rgba(62, 251, 175, 0.05) 10%, rgba(62, 251, 175, 0.00) 100%)'
          }}
        />
        <div
          className="absolute top-1/2 left-full size-150 -translate-x-30 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(47.02% 47.02% at 50% 50%, rgba(255, 231, 92, 0.05) 0%, rgba(255, 231, 92, 0.05) 10%, rgba(255, 231, 92, 0.00) 100%)'
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-16 bottom-0 flex flex-col items-center justify-between px-4 py-8 pt-5">
        <div className="absolute top-0 h-12 w-full" />
        <Logo className="h-10" />
        <div className="flex flex-col items-center pb-8">
          <p className="text-12 mb-8 leading-relaxed text-white">
            {installingUpdate
              ? 'Restarting...'
              : downloadingUpdate
                ? 'Downloading update...'
                : checkingUpdate
                  ? 'Checking for updates...'
                  : 'Starting...'}
          </p>
          <p className="text-10 leading-relaxed text-white/50">Version {APP_VERSION}</p>
          <p className="text-12 leading-relaxed text-white/80">© OptimAI Network</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-44 pb-51">
          <div className="pointer-events-none relative mt-3 size-[18.75rem]">
            <HomeNode setLottieRunning={setLottieRunning} />
          </div>
        </div>
      </div>
    </div>
  )
}

const HomeNode = ({ setLottieRunning }: { setLottieRunning: (running: boolean) => void }) => {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-1 size-[300px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.8]">
      <div>
        <div
          className="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)',
            background: 'rgba(36, 41, 38, 0.05)'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)',
            // background: "rgba(36, 41, 38, 0.05)",
            maskRepeat: 'no-repeat',
            maskImage:
              'radial-gradient(circle, black 50%, transparent 51%), linear-gradient(black, black)',
            maskComposite: 'exclude',
            maskPosition: '50% 50%, 0 0',
            maskSize: '416px 416px, 100% 100%'
          }}
        >
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '236px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '299px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '361px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
        </div>
        <Lottie
          className="absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2"
          animationData={loadingLottieData}
          loop
          onLoopComplete={() => {
            setLottieRunning(false)
          }}
          onComplete={() => {
            setLottieRunning(false)
          }}
        />
      </div>
    </div>
  )
}

export default StartUpPage
