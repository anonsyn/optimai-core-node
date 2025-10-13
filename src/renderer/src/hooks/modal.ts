import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { store } from '@/store'
import {
  ModalSliceState,
  ModalType,
  modalActions,
  selectIsModalOpen,
  selectModalData
} from '@/store/slices/modals'
import { useCallback } from 'react'

type ModalOriginData<T extends ModalType> = NonNullable<ModalSliceState[T]>['data']
type ModalData<T extends ModalType> =
  ModalOriginData<T> extends undefined ? never : NonNullable<ModalOriginData<T>>

export const useOpenModalCallback = () => {
  const dispatch = useAppDispatch()
  return useCallback(
    <T extends ModalType>(modal: T, data?: ModalData<T>, zIndex?: number) => {
      dispatch(modalActions.openModal({ modal, data, zIndex }))
    },
    [dispatch]
  )
}

type OpenModalCallback<T extends ModalType> =
  ModalData<T> extends undefined
    ? (data?: ModalData<T>, zIndex?: number) => void
    : (data: ModalData<T>, zIndex?: number) => void

export const useOpenModal = <T extends ModalType>(modal: T) => {
  const dispatch = useAppDispatch()
  return useCallback(
    (data?: ModalData<T>, zIndex?: number) => {
      dispatch(modalActions.openModal({ modal, data, zIndex }))
    },
    [dispatch, modal]
  ) as OpenModalCallback<T>
}

export const useIsModalOpen = <T extends ModalType>(modal: T) => {
  return useAppSelector((state) => selectIsModalOpen(state, modal))
}

export const useModalData = <T extends ModalType>(modal: T) => {
  return (useAppSelector((state) => selectModalData(state, modal)) || {}) as ModalData<T>
}

export const useUpdateModalData = <T extends ModalType>(modal: T) => {
  const dispatch = useAppDispatch()
  return useCallback(
    (data: ModalData<T>) => {
      dispatch(modalActions.updateModalData({ modal, data }))
    },
    [dispatch, modal]
  )
}

export const useCloseModal = <T extends ModalType>(modal: T) => {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(modalActions.closeModal(modal)), [dispatch, modal])
}

export const useModal = <T extends ModalType>(modal: T) => {
  const open = useIsModalOpen(modal)
  const data = useModalData(modal)
  const closeModal = useCloseModal(modal)

  return { open, data, closeModal }
}

export const getModalData = <T extends ModalType>(modal: T) => {
  return selectModalData(store.getState(), modal) as ModalData<T>
}
