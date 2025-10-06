import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningAssignmentsQuery } from '@/queries/mining'
import { authSelectors } from '@/store/slices/auth'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { motion } from 'framer-motion'
import lodash from 'lodash'
import { Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AssignmentItem } from './assignment-item'

export const AssignmentsList = () => {
  const { data, isLoading, refetch } = useGetMiningAssignmentsQuery({
    platforms: ['google'],
    sort_by: 'updated_at'
  })
  const walletAddress = useSelector(authSelectors.userAddress)

  const [animationParent] = useAutoAnimate()

  const assignments = data?.assignments || []

  // Listen for new assignments and refetch the list
  useEffect(() => {
    const refetchAssignments = lodash.debounce(
      () => {
        void refetch()
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
  }, [refetch])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Icon icon="LoaderCircle" className="size-8 animate-spin text-white/30" />
          <p className="text-13 text-white/40">Loading assignments...</p>
        </motion.div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <Icon icon="Pickaxe" className="size-8 text-white/60" />
          <div>
            <p className="text-18 font-medium text-white">No assignments yet</p>
            <p className="text-14 mt-1 text-white/60">Tasks will appear here when available</p>
          </div>
        </motion.div>
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
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="Pickaxe" className="size-5 text-white/80" />
              <h2 className="text-24 font-semibold text-white">Assignments</h2>
            </div>
            {walletAddress && (
              <div className="bg-secondary/50 flex items-center gap-2 rounded-2xl px-4 py-2">
                <Wallet className="size-4 text-white/60" />
                <span className="text-13 font-mono text-white/60">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* Assignment Grid */}
          <div className="grid gap-3 lg:grid-cols-1 xl:grid-cols-2" ref={animationParent}>
            {assignments.map((assignment) => (
              <AssignmentItem key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}
