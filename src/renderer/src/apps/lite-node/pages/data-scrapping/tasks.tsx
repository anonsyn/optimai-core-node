import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import {
  Record,
  RecordContent,
  RecordDescription,
  RecordExtra,
  RecordIcon,
  RecordTitle
} from '@/components/ui/record'
import Spinner from '@/components/ui/spinner'
import { useGetInfiniteProxyRewardsQuery } from '@/queries/proxy/use-get-proxy-rewards-query'
import { compactNumber } from '@/utils/compact-number'
import { format } from 'date-fns'
import lodash from 'lodash'
import { useMemo } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const Tasks = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetInfiniteProxyRewardsQuery()

  const allRows = useMemo(() => {
    if (!data) return []
    const flattenedRows = data.pages.flatMap((d) => d.items)
    return lodash.uniqBy(flattenedRows, 'task_id')
  }, [data])

  return (
    <InfiniteScroll
      dataLength={allRows.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      scrollableTarget="node-uptime"
      scrollThreshold="200px"
      loader={
        isFetchingNextPage && (
          <div className="flex w-full items-center justify-center p-4">
            <Spinner />
          </div>
        )
      }
    >
      <div className="container">
        {allRows.map((item) => {
          const title = item.task_id

          const description = item.proxy_url

          return (
            <Record key={item.task_id} className="mb-2 p-3">
              <RecordIcon>
                <Icon icon="Hexagon" />
              </RecordIcon>
              <RecordContent>
                <RecordTitle className="max-w-[49dvw] overflow-hidden text-ellipsis whitespace-nowrap">
                  #{title}
                </RecordTitle>
                <RecordDescription className="max-w-[49dvw] overflow-hidden text-ellipsis whitespace-nowrap">
                  {description}
                </RecordDescription>
              </RecordContent>
              <RecordExtra>
                <RecordTitle className="capitalize-first flex items-center justify-end gap-1">
                  +
                  {compactNumber(Number(item.amount), {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4
                  })}{' '}
                  <Token className="size-4.5" />
                </RecordTitle>
                <RecordDescription className="capitalize-first">
                  {format(item.timestamp, 'hh:mm:ss a')}
                </RecordDescription>
              </RecordExtra>
            </Record>
          )
        })}
      </div>
    </InfiniteScroll>
  )
}

export default Tasks
