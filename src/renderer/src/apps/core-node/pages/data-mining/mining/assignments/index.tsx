import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningAssignmentsQuery } from '@/queries/mining'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { motion } from 'framer-motion'
import lodash from 'lodash'
import { useEffect } from 'react'
import { AssignmentItem } from './assignment-item'

export const AssignmentsList = () => {
  const { data, isLoading, refetch } = useGetMiningAssignmentsQuery({
    platforms: ['google'],
    sort_by: 'updated_at'
  })

  const [animationParent] = useAutoAnimate()

  const assignments = data?.assignments || []

  // Listen for new assignments and refetch the list
  useEffect(() => {
    const refetchAssignments = lodash.debounce(
      () => {
        void refetch()
      },
      300,
      { maxWait: 1000 }
    )
    const assignmentListener = window.nodeIPC.onMiningAssignment(refetchAssignments)
    const completedListener = window.nodeIPC.onMiningAssignmentCompleted(refetchAssignments)

    return () => {
      assignmentListener.unsubscribe()
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
          <Icon icon="Pickaxe" className="size-8 text-white/20" />
          <div>
            <p className="text-16 font-medium text-white/60">No assignments yet</p>
            <p className="text-13 mt-1 text-white/30">Mining tasks will appear here</p>
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
      transition={{ duration: 0.5 }}
    >
      <ScrollArea className="h-full">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-2">
            <Icon icon="Pickaxe" className="size-5 text-white/80" />
            <h2 className="text-24 font-semibold text-white">Mining Assignments</h2>
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
