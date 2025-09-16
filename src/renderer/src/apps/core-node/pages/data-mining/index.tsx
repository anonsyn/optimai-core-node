import { AssignmentsList } from './assignments'
import { LeftPanel } from './left-panel'

const DataMiningPage = () => {
  return (
    <div className="flex h-full gap-5">
      <LeftPanel />
      <AssignmentsList />
    </div>
  )
}

export default DataMiningPage
