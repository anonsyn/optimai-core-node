import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { authSelectors } from '@/store/slices/auth'
import { nodeActions, nodeSelectors } from '@/store/slices/node'
import { NodeStatus } from '@main/node/types'
import { PropsWithChildren, useEffect } from 'react'

interface NodeRewardEventPayload {
  amount: string
  timestamp: number
}

interface CycleEventPayload {
  uptime: number
  created_at: number
  updated_at: number
  refresh_at: number
}

interface ConnectionEstablishedEvent {
  event: 'connection_established'
  data: {
    latest_reward?: NodeRewardEventPayload
    current_cycle: CycleEventPayload
  }
}

interface NodeRewardEvent {
  event: 'reward_earned'
  data: NodeRewardEventPayload
}

interface NodeCycleEvent {
  event: 'new_cycle'
  data: CycleEventPayload
}

type WebSocketEvent = ConnectionEstablishedEvent | NodeRewardEvent | NodeCycleEvent

const NodeProvider = ({ children }: PropsWithChildren) => {
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)
  const nodeStatus = useAppSelector(nodeSelectors.status)

  const dispatch = useAppDispatch()

  const isRunning = nodeStatus === NodeStatus.Running && isSignedIn

  useEffect(() => {
    window.nodeIPC
      .getNodeStatus()
      .then((status) => {
        console.log({ initStatus: status })
        if (status) {
          dispatch(nodeActions.setStatus(status.status as NodeStatus))
        }
      })
      .finally(() => {
        window.nodeIPC.onNodeStatusChanged((status) => {
          console.log({ status })
          dispatch(nodeActions.setStatus(status))
        })
      })
  }, [dispatch])

  useEffect(() => {
    if (isRunning) {
      let ws: WebSocket | null = null
      const syncNodeData = async () => {
        const port = await window.nodeIPC.getServerPort()
        if (!port) {
          throw new Error('Failed to get node port')
        }

        const wsUrl = `ws://127.0.0.1:${port}/ws`
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log('WebSocket connection opened')
        }

        ws.onmessage = (event) => {
          const handleConnectionEstablishedEvent = (
            payload: ConnectionEstablishedEvent['data']
          ) => {
            if (payload.latest_reward) {
              handleNewRewardEvent(payload.latest_reward)
            }
            if (payload.current_cycle) {
              handleNewCycleEvent(payload.current_cycle)
            }
          }

          const handleNewRewardEvent = (payload: NodeRewardEvent['data']) => {
            dispatch(nodeActions.setLatestNotificationReward(payload))
          }

          const handleNewCycleEvent = (payload: NodeCycleEvent['data']) => {
            dispatch(
              nodeActions.setCycle({
                uptime: payload.uptime,
                createdAt: payload.created_at,
                updatedAt: payload.updated_at,
                refreshAt: payload.refresh_at
              })
            )
          }

          try {
            const data = JSON.parse(event.data) as WebSocketEvent
            console.log('Unknown event:', data)

            switch (data.event) {
              case 'connection_established':
                handleConnectionEstablishedEvent(data.data)
                break
              case 'reward_earned':
                handleNewRewardEvent(data.data)
                break
              case 'new_cycle':
                handleNewCycleEvent(data.data)
                break
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = () => {
          console.log('WebSocket connection closed')
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

        return ws
      }

      syncNodeData()

      return () => {
        if (ws) {
          ws.close()
        }
      }
    }
  }, [isRunning, dispatch])

  console.log({ isRunning, isSignedIn })

  return <>{children}</>
}

export default NodeProvider
