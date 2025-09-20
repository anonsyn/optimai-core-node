import { dailyTaskApi } from "@/api/daily-tasks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useHasClaimedWeeklyRewardQuery = (
  options: {
    enabled?: boolean;
  } = {}
) => {
  return useQuery({
    queryKey: ["has-claimed-weekly-reward"],
    queryFn: () =>
      dailyTaskApi.hasClaimedCheckInWeeklyReward().then((res) => res.data),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
};
