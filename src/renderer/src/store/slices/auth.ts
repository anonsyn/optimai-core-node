import { User } from '@/api/auth/type'
import { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface AuthState {
  user?: User
}

const initialState: AuthState = {}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
