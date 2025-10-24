import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppSelector } from '@/hooks/redux'
import { useGetMiningAssignmentsQuery, useGetMiningStatsQuery } from '@/queries/mining'
import { nodeSelectors } from '@/store/slices/node'
import { waitingTaskAnimationData } from '@assets/lotties/waiting-task'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { motion } from 'framer-motion'
import lodash from 'lodash'
import Lottie from 'lottie-react'
import { useEffect } from 'react'
import { AssignmentItem } from './assignment-item'

export const AssignmentsList = () => {
  const deviceId = useAppSelector(nodeSelectors.deviceId)

  const {
    data,
    isLoading,
    refetch: refetchAssignment
  } = useGetMiningAssignmentsQuery({
    platforms: ['google'],
    sort_by: 'updated_at',
    device_id: deviceId
  })
  const { refetch: refetchStats } = useGetMiningStatsQuery()

  const [animationParent] = useAutoAnimate()

  const assignments = data?.assignments || []

  // Listen for new assignments and refetch the list
  useEffect(() => {
    const refetchAssignments = lodash.debounce(
      () => {
        void refetchAssignment()
        void refetchStats()
        console.log('event emitted')
      },
      300,
      { maxWait: 500 }
    )
    const assignmentsListener = window.nodeIPC.onMiningAssignments(refetchAssignments)
    const startedListener = window.nodeIPC.onMiningAssignmentStarted(refetchAssignments)
    const completedListener = window.nodeIPC.onMiningAssignmentCompleted(refetchAssignments)

    return () => {
      assignmentsListener.unsubscribe()
      startedListener.unsubscribe()
      completedListener.unsubscribe()
    }
  }, [refetchAssignment, refetchStats])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin [&>svg]:size-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              stroke="url(#paint0_linear_9584_89948)"
              strokeWidth="6"
            />
            <defs>
              <linearGradient
                id="paint0_linear_9584_89948"
                x1="10.4496"
                y1="9.71026"
                x2="84.9731"
                y2="87.6347"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFFF33" />
                <stop offset="1" stopColor="#33FF4B" />
              </linearGradient>
            </defs>
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="h-full w-full overflow-hidden">
        <Lottie animationData={waitingTaskAnimationData} loop />
      </div>
    )
  }

  return (
    <motion.div
      className="relative h-full w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ScrollArea className="h-full">
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4" ref={animationParent}>
            {assignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={{
                  ...assignment
                  // status: 'not_started'
                }}
              />
            ))}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
