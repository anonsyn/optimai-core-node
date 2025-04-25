import { dailyTaskService } from "@/services/daily-tasks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useHasClaimedWeeklyRewardQuery = (
  options: {
    enabled?: boolean;
  } = {}
) => {
  return useQuery({
    queryKey: ["has-claimed-weekly-reward"],
    queryFn: () =>
      dailyTaskService.hasClaimedCheckInWeeklyReward().then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
};
