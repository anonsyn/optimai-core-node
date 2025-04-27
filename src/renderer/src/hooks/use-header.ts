import { useAppDispatch } from '@/hooks/redux'
import { headerActions } from '@/store/slices/header'
import { useEffect } from 'react'

interface UseHeaderProps {
  title?: string
  backPath?: string
}

export const useHeader = (options?: UseHeaderProps) => {
  const shouldShowLogo = !options
  const title = options?.title
  const backPath = options?.backPath

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (shouldShowLogo) {
      dispatch(headerActions.reset())
    } else {
      dispatch(headerActions.setState({ title, backPath }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, backPath])
}
