import authSlice from '@/store/slices/auth'
import modalSlice from '@/store/slices/modals'
import onlineSlice from '@/store/slices/online'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import nodeSlice from './slices/node'

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: [authSlice.name]
// }

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [modalSlice.name]: modalSlice.reducer,
  [onlineSlice.name]: onlineSlice.reducer,
  [nodeSlice.name]: nodeSlice.reducer
})

// const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'modals/openModal',
          'modals/closeModal'
        ],
        ignoredActionsPaths: ['payload.data'],
        ignoredPaths: ['modals']
      }
    })
})

// export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
