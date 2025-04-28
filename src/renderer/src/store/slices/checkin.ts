import { RootState } from '@/store'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CheckInState {
  showModal: boolean
  shouldRunAnimation: boolean
  dailyCheckInReward: number
  alreadyCheckedIn: boolean
}

const initialState: CheckInState = {
  showModal: false,
  shouldRunAnimation: false,
  dailyCheckInReward: 0,
  alreadyCheckedIn: false
}

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    openModal: (state) => {
      state.showModal = true
    },
    closeModal: (state) => {
      state.showModal = false
    },
    setShouldRunAnimation: (state, action: PayloadAction<boolean>) => {
      state.shouldRunAnimation = action.payload
    },
    setDailyCheckInReward: (state, action: PayloadAction<number>) => {
      state.dailyCheckInReward = action.payload
    },
    setAlreadyCheckIn: (state, action: PayloadAction<boolean>) => {
      state.alreadyCheckedIn = action.payload
    }
  }
})

export const checkInActions = {
  ...checkInSlice.actions
}

export const checkInSelectors = {
  showModal: (state: RootState) => state.checkIn.showModal,
  shouldRunAnimation: (state: RootState) => state.checkIn.shouldRunAnimation,
  dailyCheckInReward: (state: RootState) => state.checkIn.dailyCheckInReward,
  alreadyCheckedIn: (state: RootState) => state.checkIn.alreadyCheckedIn
}

export default checkInSlice
