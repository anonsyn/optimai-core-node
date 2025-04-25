import { RootState } from '@/store'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export enum Modals {
  EXAMPLE = 'EXAMPLE'
}

export type ModalState<T = undefined> = {
  open: boolean
  data?: T | undefined
  zIndex?: number
}

export type LinkWalletModalState = {
  type?: 'connector' | 'mnemonic'
  success?: boolean
}

export type ReconnectToUnlinkModalState = {
  type?: 'connector' | 'mnemonic'
}

export interface ModalSliceState {
  [Modals.EXAMPLE]?: ModalState
}

export type ModalType = keyof ModalSliceState

const initialState: ModalSliceState = {}

const modalSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{ modal: ModalType; data?: any; zIndex?: number }>
    ) => {
      const { modal, data, zIndex } = action.payload
      state[modal] = { open: true, data, zIndex }
    },
    updateModalData: (state, action: PayloadAction<{ modal: ModalType; data: any }>) => {
      const { modal, data } = action.payload
      if (state[modal]) {
        state[modal]!.data = data
      }
    },
    closeModal: (state, action: PayloadAction<ModalType>) => {
      const modal = action.payload
      if (state[modal]) {
        state[modal]!.open = false
      }
    },
    closeAllModals: () => initialState
  }
})

export const modalActions = {
  ...modalSlice.actions
}

// Selectors
export const selectModalState = (state: RootState, modal: ModalType) => state.modals[modal]
export const selectIsModalOpen = (state: RootState, modal: ModalType) => state.modals[modal]?.open
export const selectModalData = (state: RootState, modal: ModalType) => state.modals[modal]?.data

export default modalSlice
