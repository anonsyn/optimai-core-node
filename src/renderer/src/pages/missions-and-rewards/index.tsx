import DailyTasks from './daily-tasks'
import TaskTabs from './tabs'

const MissionsAndRewardsPage = () => {
  return (
    <div className="h-full overflow-y-auto" data-global-glow="false">
      <div className="container space-y-5 py-4">
        <DailyTasks />
        <TaskTabs />
      </div>
    </div>
  )
}

export default MissionsAndRewardsPage
