import { dailyTaskService } from "@/services/daily-tasks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useGetDailyTasksQuery = () => {
  return useQuery({
    queryKey: ["daily-tasks"],
    queryFn: () => dailyTaskService.getDailyTasks().then((res) => res.data),
  });
};

export const useGetDailyTasksSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: ["daily-tasks"],
    queryFn: () => dailyTaskService.getDailyTasks().then((res) => res.data),
  });
};
