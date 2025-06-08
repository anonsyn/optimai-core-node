import authSlice from '@/store/slices/auth'
import headerSlice from '@/store/slices/header'
import modalSlice from '@/store/slices/modals'
import onlineSlice from '@/store/slices/online'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import checkInSlice from './slices/checkin'
import nodeSlice from './slices/node'

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: [authSlice.name]
// }

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [modalSlice.name]: modalSlice.reducer,
  [headerSlice.name]: headerSlice.reducer,
  [onlineSlice.name]: onlineSlice.reducer,
  [checkInSlice.name]: checkInSlice.reducer,
  [nodeSlice.name]: nodeSlice.reducer
})

// const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
})

// export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
