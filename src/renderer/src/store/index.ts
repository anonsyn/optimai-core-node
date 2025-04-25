import modalSlice from '@/store/slices/modals'
import { combineReducers, configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: combineReducers({
    [modalSlice.name]: modalSlice.reducer
  })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
