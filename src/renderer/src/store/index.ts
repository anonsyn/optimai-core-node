import authSlice from '@/store/slices/auth'
import headerSlice from '@/store/slices/header'
import modalSlice from '@/store/slices/modals'
import onlineSlice from '@/store/slices/online'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import checkInSlice from './slices/checkin'
export const store = configureStore({
  reducer: combineReducers({
    [authSlice.name]: authSlice.reducer,
    [modalSlice.name]: modalSlice.reducer,
    [headerSlice.name]: headerSlice.reducer,
    [onlineSlice.name]: onlineSlice.reducer,
    [checkInSlice.name]: checkInSlice.reducer
  })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
