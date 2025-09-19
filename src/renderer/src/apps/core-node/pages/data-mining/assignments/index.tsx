import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMiningAssignmentsQuery } from '@/queries/mining'
import { AssignmentItem } from './assignment-item'

export const AssignmentsList = () => {
  const { data, isLoading } = useGetMiningAssignmentsQuery()
  const assignments = data?.assignments || []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No assignments found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full">
        <div className="flex w-full flex-col gap-6 p-6">
          {assignments.map((assignment) => (
            <AssignmentItem key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
