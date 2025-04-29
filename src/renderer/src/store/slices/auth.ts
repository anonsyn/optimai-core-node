import { User } from '@/services/auth/type'
import { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface AuthState {
  isChecking: boolean
  isChecked: boolean
  user?: User
}

const initialState: AuthState = {
  isChecking: true,
  isChecked: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<AuthState>) => {
      const { isChecking, isChecked, user } = action.payload
      state.isChecking = isChecking
      state.isChecked = isChecked
      state.user = user
    },
    setIsChecking: (state, action: PayloadAction<boolean>) => {
      state.isChecking = action.payload
    },
    setIsChecked: (state, action: PayloadAction<boolean>) => {
      state.isChecked = action.payload
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload
    }
  }
})

export const authActions = {
  ...authSlice.actions
}

export const authSelectors = {
  state: (state: RootState) => state.auth,
  isCheckingAuth: (state: RootState) => state.auth.isChecking,
  isCheckedAuth: (state: RootState) => state.auth.isChecked,
  isSignedIn: (state: RootState) => !!state.auth.user,
  user: (state: RootState) => state.auth.user,
  userId: (state: RootState) => state.auth.user?.id,
  userEmail: (state: RootState) => state.auth.user?.email,
  username: (state: RootState) => state.auth.user?.display_name,
  userAddress: (state: RootState) => state.auth.user?.wallet_address,
  hasNodes: (state: RootState) => state.auth.user?.has_nodes,
  encryptedPrivateKey: (state: RootState) => state.auth.user?.encrypted_private_key,
  isConnectedTelegram: (state: RootState) => !!state.auth.user?.telegram,
  isConnectedTwitter: (state: RootState) => !!state.auth.user?.twitter
}

export default authSlice
