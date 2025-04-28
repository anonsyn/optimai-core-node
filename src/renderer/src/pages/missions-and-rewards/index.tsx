import DailyTasks from './daily-tasks'

const MissionsAndRewardsPage = () => {
  return (
    <div className="h-full overflow-y-auto" data-global-glow="false">
      <div className="container space-y-5 py-4">
        <DailyTasks />
      </div>
    </div>
  )
}

export default MissionsAndRewardsPage
