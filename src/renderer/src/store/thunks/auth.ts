import { authApi } from '@/api/auth'
import { queryClient } from '@/queries/client'
import { AppDispatch } from '@/store'
import { authActions } from '@/store/slices/auth'
import { sessionManager } from '@/utils/session-manager'

export const logoutThunk = () => async (dispatch: AppDispatch) => {
  try {
    await window.nodeIPC.stopNode()
  } catch (error) {
    console.error(error)
  }

  try {
    await authApi.signOut()
  } catch (error) {
    console.error('Failed to sign out via API:', error)
  }

  await sessionManager.clearTokens().catch((error) => {
    console.error('Failed to clear tokens:', error)
  })

  queryClient.removeQueries()
  dispatch(authActions.setUser(undefined))
}
