import { RootState } from '@/store'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OnlineState {
  isOnline: boolean
}

const initialState: OnlineState = {
  isOnline: true
}

const onlineSlice = createSlice({
  name: 'online',
  initialState,
  reducers: {
    setIsOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    }
  }
})

export const onlineActions = {
  ...onlineSlice.actions
}

export const onlineSelectors = {
  isOnline: (state: RootState) => state.online.isOnline
}

export default onlineSlice
