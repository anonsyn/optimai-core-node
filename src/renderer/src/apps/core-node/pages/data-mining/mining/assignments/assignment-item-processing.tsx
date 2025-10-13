import { MiningAssignment } from '@main/node/types'
import { format } from 'date-fns'
import lodash from 'lodash'
import { Clock, Newspaper } from 'lucide-react'
import Domain from './domain'
import PreviewImage from './preview-image'
import StatusIndicator from './status-indicator'

interface AssignmentItemProcessingProps {
  assignment: MiningAssignment
}

export const AssignmentItemProcessing = ({ assignment }: AssignmentItemProcessingProps) => {
  const status = lodash.get(assignment, 'status', '')
  const sourceUrl = lodash.get(assignment, 'task.source_url', '')
  const updatedAt = lodash.get(assignment, 'updated_at', lodash.get(assignment, 'started_at', ''))

  const isProcessing = status.toLowerCase() === 'in_progress'

  const handleOpenUrl = () => {
    if (sourceUrl) {
      window.windowIPC.openExternalLink(sourceUrl)
    }
  }

  return (
    <div className="bg-secondary/40 relative overflow-hidden rounded-xl border border-white/4 backdrop-blur-[10px]">
      {/* Header */}
      <div className="flex h-12 items-center justify-between bg-white/[0.08] px-4">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <StatusIndicator variant={status as any} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenUrl}
            className="bg-background/50 hover:bg-background/70 flex size-8 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white"
          >
            <Newspaper className="size-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="bg-raydial-05 relative flex flex-col gap-3 p-4"
        style={{
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.32) inset'
        }}
      >
        <div className="relative flex gap-[18px]">
          <PreviewImage />

          {/* Content Details */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="flex flex-col gap-1">
              <Domain sourceUrl={sourceUrl} />

              <div className="flex flex-col leading-[1.5]">
                <h3 className="text-16 font-semibold tracking-tight text-white">{sourceUrl}</h3>
                {isProcessing && (
                  <p className="text-14 animate-shine via-yellow text-yellow/40 w-fit bg-gradient-to-r from-transparent to-transparent bg-[length:200%_100%] bg-clip-text !duration-[5s]">
                    Getting content from website
                  </p>
                )}
              </div>
            </div>

            {/* Content Footer - Timestamp */}
            <div className="flex items-center gap-2 opacity-50">
              <Clock className="size-4 text-white" />
              <span className="text-14 text-white">
                {updatedAt ? format(new Date(updatedAt), 'MMM dd, yyyy h:mm a') : 'Just now'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
