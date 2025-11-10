import { MiningStatus, type MiningWorkerStatus } from '@main/node/types'
import { useEffect, useState } from 'react'
import { MiningLoading } from './mining-loading'
import { MiningOperational } from './mining-operational'

const isLoadingStatus = (status: MiningStatus) =>
  [MiningStatus.Idle, MiningStatus.Initializing, MiningStatus.InitializingCrawler].includes(status)

const isOperationalStatus = (status: MiningStatus) =>
  [MiningStatus.Ready, MiningStatus.Processing, MiningStatus.Error, MiningStatus.Stopped].includes(
    status
  )

export const Mining = () => {
  const [miningStatus, setMiningStatus] = useState<MiningWorkerStatus>({
    status: MiningStatus.Idle,
    isProcessing: false,
    assignmentCount: 0
  })

  useEffect(() => {
    // Get initial status
    window.nodeIPC
      .getMiningStatus()
      .then((status) => {
        console.log('[Mining] Initial status:', status)
        setMiningStatus(status)
      })
      .catch(console.error)

    // Listen for status changes
    const unsubscribe = window.nodeIPC.onMiningStatusChanged((status) => {
      console.log('[Mining] Status changed:', status)
      setMiningStatus(status)
    })

    return () => {
      unsubscribe.unsubscribe()
    }
  }, [])

  // Group 1: Loading states
  if (isLoadingStatus(miningStatus.status)) {
    return <MiningLoading />
  }

  // Group 2: Operational states
  if (isOperationalStatus(miningStatus.status)) {
    return <MiningOperational status={miningStatus} />
  }

  // Fallback (shouldn't happen)
  return null
}
