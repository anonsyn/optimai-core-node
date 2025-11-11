import { useAppDispatch } from '@/hooks/redux'
import { nodeActions } from '@/store/slices/node'
import { ReactNode, useEffect, useRef } from 'react'

interface NodeProviderProps {
  children: ReactNode
}

/**
 * NodeProvider syncs node data from the main process to Redux store
 * It listens to IPC events from the main process and updates the Redux store accordingly
 */
export function NodeProvider({ children }: NodeProviderProps) {
  const dispatch = useAppDispatch()
  const cleanupFunctionsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    // Clean up any existing listeners
    cleanupFunctionsRef.current.forEach((cleanup) => cleanup())
    cleanupFunctionsRef.current = []

    cleanupFunctionsRef.current.push(
      window.nodeIPC.onDeviceIdChanged((deviceId) => {
        dispatch(nodeActions.setDeviceId(deviceId))
      }).unsubscribe,
      window.nodeIPC.onMiningStatusChanged((status) => {
        dispatch(nodeActions.setMiningStatus(status))
      }).unsubscribe,
      window.nodeIPC.onMiningError((error) => {
        dispatch(nodeActions.setMiningError(error))
      }).unsubscribe
    )

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        // Get device info to set device ID
        const localDeviceInfo = await window.nodeIPC.getLocalDeviceInfo()
        if (localDeviceInfo?.device_id) {
          dispatch(nodeActions.setDeviceId(localDeviceInfo.device_id))
        }

        // Get mining status if available
        try {
          const miningStatus = await window.nodeIPC.getMiningStatus()
          dispatch(nodeActions.setMiningStatus(miningStatus))
        } catch (error) {
          // Mining might not be initialized yet
          console.debug('Mining status not available yet:', error)
        }
      } catch (error) {
        console.error('Failed to fetch initial node data:', error)
      }
    }

    fetchInitialData()

    // Cleanup on unmount
    return () => {
      cleanupFunctionsRef.current.forEach((cleanup) => cleanup())
      cleanupFunctionsRef.current = []
    }
  }, [dispatch])

  return <>{children}</>
}
