import {
  Task,
  TaskAction,
  TaskBody,
  TaskContent,
  TaskDescription,
  TaskFooter,
  TaskIcon,
  TaskReward,
  TaskTitle
} from '@/components/modules/task'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSelector } from '@/hooks/redux'
import { useGetCommunityMissionsQuery } from '@/queries/missions/use-get-community-missions-query'
import { useGetEngagementMissionsQuery } from '@/queries/missions/use-get-engagement-missions-query'
import { useGetNetworkMissionsQuery } from '@/queries/missions/use-get-network-missions-query'
import { MissionType } from '@/services/missions'
import { authSelectors } from '@/store/slices/auth'

const Missions = () => {
  const isConnectedTelegram = useAppSelector(authSelectors.isConnectedTelegram)
  const isConnectedTwitter = useAppSelector(authSelectors.isConnectedTwitter)

  const { data: communityMissions = [], isLoading: isCommunityMissionsLoading } =
    useGetCommunityMissionsQuery()

  const { data: networkMissions = [], isLoading: isNetworkMissionsLoading } =
    useGetNetworkMissionsQuery()

  const { data: engagementMissions = [], isLoading: isEngagementMissionsLoading } =
    useGetEngagementMissionsQuery()

  const isLoading =
    isCommunityMissionsLoading || isNetworkMissionsLoading || isEngagementMissionsLoading

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[134px] w-full" />
        <Skeleton className="h-[134px] w-full" />
        <Skeleton className="h-[134px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {communityMissions.map((task) => {
        return (
          <Task
            key={task.id}
            task={task}
            taskType={MissionType.COMMUNITY}
            isConnectedTelegram={isConnectedTelegram}
            isConnectedTwitter={isConnectedTwitter}
          >
            <TaskContent>
              <TaskIcon />
              <TaskBody>
                <TaskTitle />
                <TaskDescription />
              </TaskBody>
            </TaskContent>
            <TaskFooter>
              <TaskAction />
              <TaskReward />
            </TaskFooter>
          </Task>
        )
      })}
      {networkMissions.map((task) => {
        return (
          <Task
            key={task.id}
            task={task}
            taskType={MissionType.NETWORK}
            isConnectedTelegram={isConnectedTelegram}
            isConnectedTwitter={isConnectedTwitter}
          >
            <TaskContent>
              <TaskIcon />
              <TaskBody>
                <TaskTitle />
                <TaskDescription />
              </TaskBody>
            </TaskContent>
            <TaskFooter>
              <TaskAction />
              <TaskReward />
            </TaskFooter>
          </Task>
        )
      })}
      {engagementMissions.map((task) => {
        return (
          <Task
            key={task.id}
            task={task}
            taskType={MissionType.ENGAGEMENT}
            isConnectedTelegram={isConnectedTelegram}
            isConnectedTwitter={isConnectedTwitter}
          >
            <TaskContent>
              <TaskIcon />
              <TaskBody>
                <TaskTitle />
                <TaskDescription />
              </TaskBody>
            </TaskContent>
            <TaskFooter>
              <TaskAction />
              <TaskReward />
            </TaskFooter>
          </Task>
        )
      })}
    </div>
  )
}

export default Missions
