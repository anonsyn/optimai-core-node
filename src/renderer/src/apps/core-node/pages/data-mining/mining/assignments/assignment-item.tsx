import { MiningAssignment } from '@main/node/types'
import lodash from 'lodash'
import { AssignmentItemCompleted } from './assignment-item-completed'
import { AssignmentItemProcessing } from './assignment-item-processing'

interface AssignmentItemProps {
  assignment: MiningAssignment
}

export const AssignmentItem = ({ assignment }: AssignmentItemProps) => {
  const status = lodash.get(assignment, 'status', '')
  const isCompleted = status.toLowerCase() === 'completed'

  // Render different component based on status
  if (isCompleted) {
    return <AssignmentItemCompleted assignment={assignment} />
  } else {
    return <AssignmentItemProcessing assignment={assignment} />
  }
}
