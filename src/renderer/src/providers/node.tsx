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

    // Setup IPC event listeners
    const setupListeners = () => {
      // Node status changes
      const statusListener = window.nodeIPC.onStatusChanged((status) => {
        dispatch(nodeActions.setNodeStatus(status))
      })
      cleanupFunctionsRef.current.push(statusListener.unsubscribe)

      // Uptime cycle updates
      const cycleListener = window.nodeIPC.onUptimeCycle((cycle) => {
        dispatch(nodeActions.setUptimeCycle(cycle))
      })
      cleanupFunctionsRef.current.push(cycleListener.unsubscribe)

      // Uptime rewards
      const rewardListener = window.nodeIPC.onUptimeReward((reward) => {
        dispatch(nodeActions.setUptimeReward(reward))
      })
      cleanupFunctionsRef.current.push(rewardListener.unsubscribe)

      // Mining assignments
      const assignmentsListener = window.nodeIPC.onMiningAssignments((assignments) => {
        dispatch(nodeActions.setMiningAssignments(assignments))
      })
      cleanupFunctionsRef.current.push(assignmentsListener.unsubscribe)

      // Mining assignment started
      const assignmentStartedListener = window.nodeIPC.onMiningAssignmentStarted(
        (assignmentId) => {
          dispatch(nodeActions.setMiningAssignmentStarted(assignmentId))
        }
      )
      cleanupFunctionsRef.current.push(assignmentStartedListener.unsubscribe)

      // Mining assignment completed
      const assignmentCompletedListener = window.nodeIPC.onMiningAssignmentCompleted(
        (assignmentId) => {
          dispatch(nodeActions.setMiningAssignmentCompleted(assignmentId))
        }
      )
      cleanupFunctionsRef.current.push(assignmentCompletedListener.unsubscribe)

      // Mining status changes
      const miningStatusListener = window.nodeIPC.onMiningStatusChanged((status) => {
        dispatch(nodeActions.setMiningStatus(status))
      })
      cleanupFunctionsRef.current.push(miningStatusListener.unsubscribe)

      // Node errors
      const nodeErrorListener = window.nodeIPC.onNodeError((payload) => {
        dispatch(nodeActions.setNodeError(payload.message))
      })
      cleanupFunctionsRef.current.push(nodeErrorListener.unsubscribe)

      // Mining errors
      const miningErrorListener = window.nodeIPC.onMiningError((payload) => {
        dispatch(nodeActions.setMiningError(payload.message))
      })
      cleanupFunctionsRef.current.push(miningErrorListener.unsubscribe)
    }

    setupListeners()

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        // Get current status
        const status = await window.nodeIPC.getStatus()
        dispatch(nodeActions.setNodeStatus(status))

        // Get device info to set device ID
        const { deviceInfo } = await window.nodeIPC.getDeviceInfo()
        if (deviceInfo?.device_id) {
          dispatch(nodeActions.setDeviceId(deviceInfo.device_id))
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