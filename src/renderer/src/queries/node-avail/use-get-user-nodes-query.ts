import { nodeAvailApi } from '@/api/node-avail'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { nodeAvailKeys } from './keys'

const getQueryOptions = () => {
  return {
    queryKey: nodeAvailKeys.userNodes(),
    queryFn: () => {
      try {
        return nodeAvailApi.getUserNodes().then((res) => res.data)
      } catch (error) {
        console.log({ error })
      }
      return {
        nodes: []
      }
    },
    refetchInterval: 60000
  }
}

export const useGetUserNodesQuery = () => {
  return useQuery({
    ...getQueryOptions()
  })
}
export const useGetUserNodesSuspenseQuery = () => {
  return useSuspenseQuery({
    ...getQueryOptions()
  })
}
