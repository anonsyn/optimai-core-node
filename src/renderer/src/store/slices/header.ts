import { RootState } from '@/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface HeaderState {
  title?: string
  backPath?: string
}

const initialState: HeaderState = {}

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<HeaderState>) => {
      return { ...state, ...action.payload }
    },
    reset: () => initialState
  }
})

export const headerActions = {
  ...headerSlice.actions
}

export const headerSelectors = {
  title: (state: RootState) => state.header.title,
  backPath: (state: RootState) => state.header.backPath
}

export default headerSlice
