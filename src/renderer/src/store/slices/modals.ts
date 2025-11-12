import { Mission, MissionType } from '@/api/missions'
import { RootState } from '@/store'
import { AppError } from '@/types/errors'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export enum Modals {
  LOGOUT_CONFIRMATION = 'LOGOUT_CONFIRMATION',
  VERIFY_TWITTER_TASK = 'VERIFY_TWITTER_TASK',
  DASHBOARD_MISSION = 'DASHBOARD_MISSION',
  ON_BOARDING = 'ON_BOARDING',
  LOGIN = 'LOGIN',
  DOCKER_NOT_INSTALLED = 'DOCKER_NOT_INSTALLED',
  DOCKER_NOT_RUNNING = 'DOCKER_NOT_RUNNING',
  ASSIGNMENT_DETAILS = 'ASSIGNMENT_DETAILS',
  UPDATE_READY = 'UPDATE_READY',
  WINDOWS_UPDATE_AVAILABLE = 'WINDOWS_UPDATE_AVAILABLE',
  MINING_STOPPED = 'MINING_STOPPED',
  MINING_ERROR = 'MINING_ERROR',
  REPORT_ISSUE = 'REPORT_ISSUE'
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
  [Modals.LOGOUT_CONFIRMATION]?: ModalState
  [Modals.VERIFY_TWITTER_TASK]?: ModalState<{
    task: Mission
    taskType: MissionType
  }>
  [Modals.DASHBOARD_MISSION]?: ModalState
  [Modals.ON_BOARDING]?: ModalState
  [Modals.LOGIN]?: ModalState<{
    onSuccess: () => void
  }>
  [Modals.DOCKER_NOT_INSTALLED]?: ModalState<{
    onRetry: () => Promise<boolean>
  }>
  [Modals.DOCKER_NOT_RUNNING]?: ModalState<{
    onRetry: () => Promise<any>
    autoCheck?: boolean
    canDismiss?: boolean
  }>
  [Modals.ASSIGNMENT_DETAILS]?: ModalState<{
    assignmentId: string
    sourceUrl?: string
  }>
  [Modals.UPDATE_READY]?: ModalState<{
    version?: string
    releaseNotes?: string
  }>
  [Modals.WINDOWS_UPDATE_AVAILABLE]?: ModalState<{
    version?: string
    releaseNotes?: string
  }>
  [Modals.MINING_STOPPED]?: ModalState
  [Modals.MINING_ERROR]?: ModalState<{
    error?: AppError
  }>
  [Modals.REPORT_ISSUE]?: ModalState
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
