import Token from '@/components/branding/token'
import { useOpenModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'
import { formatNumber } from '@/utils/number'
import { MiningAssignment } from '@main/node/types'
import { format } from 'date-fns'
import lodash from 'lodash'
import { Clock, Newspaper, ScanSearch } from 'lucide-react'
import Domain from './domain'
import PreviewImage from './preview-image'
import StatusIndicator from './status-indicator'

interface AssignmentItemCompletedProps {
  assignment: MiningAssignment
}

export const AssignmentItemCompleted = ({ assignment }: AssignmentItemCompletedProps) => {
  const id = lodash.get(assignment, 'id', '')
  const sourceUrl = lodash.get(assignment, 'task.source_url', '')
  const reward = lodash.get(assignment, 'task.reward_amount', 0)
  const updatedAt = lodash.get(assignment, 'updated_at', lodash.get(assignment, 'started_at', ''))

  const openAssignmentDetails = useOpenModal(Modals.ASSIGNMENT_DETAILS)

  // Metadata from assignment level (when completed)
  const metadataTitle = lodash.get(assignment, 'metadata.title', '')
  const metadataDescription =
    lodash.get(assignment, 'metadata.og:description', '') ||
    lodash.get(assignment, 'metadata.description', '') ||
    lodash.get(assignment, 'task.metadata.snippet', '')
  const favicon = lodash.get(assignment, 'metadata.favicon', '')
  const previewImage =
    lodash.get(assignment, 'metadata.og:image', '') ||
    lodash.get(assignment, 'metadata.preview_image', '')

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
          <StatusIndicator />

          {/* Reward Badge */}
          <div className="bg-background/60 flex h-9 items-center gap-1 rounded-full border border-white/10 px-3 py-1">
            <span className="text-14 font-bold text-white">
              +{formatNumber(reward, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <Token className="size-4" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => openAssignmentDetails({ assignmentId: id, sourceUrl })}
            className="bg-background/50 hover:bg-background/70 flex size-8 items-center justify-center rounded-md text-white/50 transition-colors hover:text-white"
          >
            <ScanSearch className="size-4" />
          </button>
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
          <PreviewImage src={previewImage} />

          {/* Content Details */}
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="flex flex-col gap-1">
              <Domain sourceUrl={sourceUrl} favicon={favicon} />

              <div className="flex flex-col leading-[1.5]">
                <h3 className="text-16 line-clamp-1 font-semibold tracking-tight text-white">
                  {metadataTitle || 'Untitled Page'}
                </h3>
                {metadataDescription && (
                  <p className="text-14 line-clamp-2 text-white/80">{metadataDescription}</p>
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

        <div className="text-12 bg-background/50 flex h-8 items-center gap-1 rounded-lg px-3 font-normal text-white">
          <span className="opacity-50">Source:</span>
          <span className="truncate opacity-50">{sourceUrl}</span>
        </div>
      </div>
    </div>
  )
}
