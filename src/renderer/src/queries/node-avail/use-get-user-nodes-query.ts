import { nodeAvailApi } from '@/api/node-avail'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

const getQueryOptions = () => {
  return {
    queryKey: ['node-avail-user-nodes'],
    queryFn: () => {
      try {
        return nodeAvailApi.getUserNodes().then((res) => res.data)
      } catch (error) {
        console.log({ error })
      }
      return {
        nodes: [],
      }
    },
    refetchInterval: 60000,
  }
}

export const useGetUserNodesQuery = () => {
  return useQuery({
    ...getQueryOptions(),
  })
}
export const useGetUserNodesSuspenseQuery = () => {
  return useSuspenseQuery({
    ...getQueryOptions(),
  })
}
