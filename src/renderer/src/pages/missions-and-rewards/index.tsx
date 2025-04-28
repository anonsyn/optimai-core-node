import DashboardMissionModal from '@/modals/dashboard-mission-modal'
import VerifyTwitterTaskModal from '@/modals/verify-twitter-task-modal'
import DailyTasks from './daily-tasks'
import TaskTabs from './tabs'

const MissionsAndRewardsPage = () => {
  return (
    <div className="h-full overflow-y-auto" data-global-glow="false">
      <div className="container space-y-5 py-4">
        <DailyTasks />
        <TaskTabs />
        <VerifyTwitterTaskModal />
        <DashboardMissionModal />
      </div>
    </div>
  )
}

export default MissionsAndRewardsPage
