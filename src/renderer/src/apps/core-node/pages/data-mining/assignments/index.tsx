import { Icon } from '@/components/ui/icon'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningAssignmentsQuery } from '@/queries/mining'
import { AnimatePresence, motion } from 'framer-motion'
import lodash from 'lodash'
import { useEffect } from 'react'
import { AssignmentItem } from './assignment-item'

export const AssignmentsList = () => {
  const { data, isLoading, refetch } = useGetMiningAssignmentsQuery({
    platforms: ['google'],
    sort_by: 'updated_at'
  })
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
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="bg-main h-16 w-16 rounded-full opacity-20"
            />
            <Icon icon="LoaderCircle" className="absolute inset-0 m-auto size-8 text-white/50" />
          </div>
          <p className="text-14 text-white/40">Loading assignments...</p>
        </motion.div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="bg-main rounded-full p-4">
            <Icon icon="Pickaxe" className="size-8 text-black" />
          </div>
          <div>
            <h3 className="text-18 font-semibold text-white">No Assignments Yet</h3>
            <p className="text-14 mt-2 text-white/40">New mining tasks will appear here</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-24 font-bold text-white">Active Assignments</h2>
                <p className="text-14 mt-1 text-white/40">
                  {assignments.length} task{assignments.length !== 1 ? 's' : ''} in queue
                </p>
              </div>
              <div className="bg-main rounded-full px-4 py-2">
                <span className="text-12 font-bold text-black">
                  {assignments.filter((a) => a.status?.toLowerCase() === 'in_progress').length}{' '}
                  Running
                </span>
              </div>
            </div>
          </motion.div>

          {/* Assignment Grid */}
          <div className="grid gap-4 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2">
            <AnimatePresence>
              {assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AssignmentItem assignment={assignment} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
