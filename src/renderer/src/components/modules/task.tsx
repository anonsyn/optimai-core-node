/* eslint-disable react-refresh/only-export-components */
import { Pi } from '@/components/branding/pi'
import Token from '@/components/branding/token'
import TaskIconBackground from '@/components/svgs/task-icon-background'
import { SubmitButton } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { toastError, toastSuccess } from '@/components/ui/toast'
import { useOpenModal } from '@/hooks/modal'
import { RQUERY as MISSIONS_STATS_RQUERY } from '@/queries/missions/use-get-missions-stats-query'
import {
  useInvalidateMissionsQuery,
  useVerifyTaskMutationFn
} from '@/queries/missions/use-verify-mission-mutation'
import { authService } from '@/services/auth'
import { Mission, TaskAction as MissionAction, MissionType, TaskStatus } from '@/services/missions'
import { Modals } from '@/store/slices/modals'
import { formatNumber } from '@/utils/format-number'
import { getErrorMessage } from '@/utils/get-error-message'
import { sleep } from '@/utils/sleep'
import { cn } from '@/utils/tw'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react'

const getPlatform = (task: Mission) => {
  if ('platform' in task) {
    return task.platform
  }

  if ('metadata' in task && task.metadata) {
    return task.metadata.platform as string | undefined
  }

  return undefined
}
const isUptimeTask = (task: Mission) => {
  return 'task_type' in task && task.task_type === 'uptime'
}

const isTwitterTask = (task: Mission) => {
  const platform = getPlatform(task)

  return platform === 'twitter'
}

const isConnectTwitterTask = (task: Mission) => {
  return isTwitterTask(task) && task.action === 'connect'
}

const isRateExtensionTask = (task: Mission) => {
  return 'platform' in task && task.platform === 'chrome_store' && task.action === 'rate'
}

const isTelegramTask = (task: Mission) => {
  const platform = getPlatform(task)

  return platform === 'telegram'
}

const isConnectTelegramTask = (task: Mission) => {
  return isTelegramTask(task) && task.action === 'connect'
}

const isDownloadTask = (task: Mission) => {
  return 'task_type' in task && task.task_type === 'download'
}

const isDownloadExtensionTask = (task: Mission) => {
  return task.action === 'download_extension_lite'
}

const isLinkTelegramMission = (task: Mission) => {
  return 'task_type' in task && task.task_type === 'link_telegram_node'
}

// const isDownloadCoreNodeTask = (task: Mission) => {
//   return task.action === 'download_core'
// }

// const isDownloadEdgeNodeTask = (task: Mission) => {
//   return task.action === 'download_edge'
// }

interface UseTaskOptions {
  task: Mission
  taskType: MissionType
  isConnectedTwitter?: boolean
  isConnectedTelegram?: boolean
}

const useTask = ({ task, taskType, isConnectedTelegram, isConnectedTwitter }: UseTaskOptions) => {
  const queryClient = useQueryClient()
  const verifyTaskMutationFn = useVerifyTaskMutationFn(task, taskType)
  const invalidateMissionsQuery = useInvalidateMissionsQuery(taskType)

  const status = task.status
  const failureReason = task.failure_reason

  const [started, setStarted] = useState(false)
  const [errorMessage, setErrorMessage] = useState(failureReason)
  const prevStatus = useRef(status)

  const { mutateAsync, isPending: isMutationPending } = useMutation({
    mutationFn: async () => {
      return verifyTaskMutationFn()
        .then(() => {
          return sleep(100)
        })
        .then(() => {
          return invalidateMissionsQuery()
        })
        .then(() => {
          return sleep(100)
        })
        .catch((err) => {
          toastError(getErrorMessage(err, 'Failed to verify task'))
        })
    }
  })

  const verifyTask = async () => {
    await mutateAsync().finally(() => {
      setStarted(false)
    })
  }

  const isVerifying = isMutationPending || status === TaskStatus.VERIFYING

  if (task.id === '01956a7d-344d-72f9-a362-8d4fc7b6df65') {
    console.log({ status, isMutationPending, isVerifying })
  }

  useEffect(() => {
    if (started) {
      const resetTime = 1000 * 60 * 3
      const id = setTimeout(() => {
        setStarted(false)
      }, resetTime)

      return () => clearTimeout(id)
    }
  }, [started])

  useEffect(() => {
    if (failureReason !== errorMessage) {
      setErrorMessage(failureReason)
      if (failureReason) {
        toastError(failureReason, {
          id: task.id
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failureReason])

  useEffect(() => {
    if (prevStatus.current !== status) {
      prevStatus.current = status
      if (status === 'completed') {
        queryClient.invalidateQueries({ queryKey: MISSIONS_STATS_RQUERY() })
        toastSuccess('Task completed', {
          id: task.id
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return {
    task,
    taskType,
    started,
    isVerifying,
    setStarted,
    verifyTask,
    isMutationPending,
    isConnectedTelegram,
    isConnectedTwitter
  }
}

type TaskContextState = ReturnType<typeof useTask>

const TaskContext = createContext<TaskContextState | null>(null)

const useTaskContext = () => {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }

  return context
}

const TaskProvider = ({ children, ...value }: PropsWithChildren<TaskContextState>) => {
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

type TaskProps = React.HTMLAttributes<HTMLDivElement> & UseTaskOptions

const Task = ({
  className,
  task,
  taskType,
  isConnectedTelegram,
  isConnectedTwitter,
  children,
  ...props
}: TaskProps) => {
  const state = useTask({ task, taskType, isConnectedTelegram, isConnectedTwitter })

  return (
    <TaskProvider {...state}>
      <div
        id={task.id}
        data-type={taskType}
        className={cn(
          'rounded-10 bg-raydial-05 hover:bg-raydial-10 grid grid-cols-1 gap-5 overflow-hidden border border-[#313532] p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </TaskProvider>
  )
}

const TaskContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3', className)}
      {...props}
    />
  )
}

const renderIcon = (task: Mission) => {
  if (isDownloadTask(task)) {
    if (isDownloadExtensionTask(task)) {
      return <Icon icon="Extension" />
    }
    return <Pi className="h-4.5" />
  }

  if (isUptimeTask(task)) {
    return <Icon icon="Timer" />
  }

  if (isTwitterTask(task)) {
    return <Icon icon="Twitter" />
  }

  if (isTelegramTask(task) || task.action_url?.includes('t.me/')) {
    return <Icon icon="Telegram" />
  }

  return <Icon icon="Globe" />
}

interface TaskIconProps extends React.HTMLAttributes<HTMLDivElement> {}

const TaskIcon = ({ className, ...props }: TaskIconProps) => {
  const { task } = useTaskContext()

  return (
    <div
      className={cn('relative flex size-12 items-center justify-center rounded-lg', className)}
      {...props}
    >
      <TaskIconBackground className="absolute inset-0 size-full" />
      <span className="block">{renderIcon(task)}</span>
    </div>
  )
}

interface TaskBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const TaskBody = ({ className, ...props }: TaskBodyProps) => {
  return <div className={cn('w-full', className)} {...props} />
}

interface TaskTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const TaskTitle = ({ className, ...props }: TaskTitleProps) => {
  const { task } = useTaskContext()

  return (
    <p
      className={cn('text-16 line-clamp-2 w-full leading-normal font-medium', className)}
      {...props}
    >
      {task.title}
    </p>
  )
}

interface TaskDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const TaskDescription = ({ className, ...props }: TaskDescriptionProps) => {
  const { task } = useTaskContext()

  return (
    <p
      className={cn(
        'text-14 line-clamp-2 w-full leading-normal break-words text-white/50',
        className
      )}
      {...props}
    >
      {task.description}
    </p>
  )
}

const TaskFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('grid h-11 w-full grid-cols-2 items-center gap-2 sm:min-w-[304px]', className)}
      {...props}
    />
  )
}

const TWITTER_ACTIONS = [
  MissionAction.TWEET,
  MissionAction.RETWEET,
  MissionAction.COMMENT,
  MissionAction.QUOTE
] as const

const renderTaskAction = (task: Mission) => {
  const action = task.action

  if (task.action.includes('_')) {
    const mappedText = {
      download_extension_lite: 'Download',
      download_core: 'Download',
      download_edge: 'Download',
      tlg_chat_boost: 'Boost',
      link_telegram_node: 'Start'
    }

    if (action in mappedText) {
      return mappedText[action as keyof typeof mappedText]
    }

    return action.split('_').join(' ')
  }

  return action
}

const TaskAction = ({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => {
  const {
    task,
    started,
    setStarted,
    verifyTask,
    isVerifying,
    taskType,
    isConnectedTelegram,
    isConnectedTwitter
  } = useTaskContext()

  const shouldVerify = started || isUptimeTask(task)

  const shouldDisableTelegramTask = isTelegramTask(task)
    ? isConnectedTelegram
      ? false
      : isConnectTelegramTask(task)
        ? false
        : !isLinkTelegramMission(task)
    : false

  const shouldDisableTwitterTask = isTwitterTask(task)
    ? isConnectedTwitter
      ? false
      : !isConnectTwitterTask(task)
    : false

  const handleConnectTwitter = async () => {
    try {
      const res = await authService.getTwitterAuthUrl()
      const url = res.data.url

      const width = 500
      const height = 800
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const handleEventMessage = (event: MessageEvent) => {
        if (event.data.type === 'TWITTER_LINKED') {
          window.removeEventListener('message', handleEventMessage)
        } else if (event.data.type === 'TWITTER_LINK_ERROR') {
          window.removeEventListener('message', handleEventMessage)
          setStarted(false)
          const message = event.data.error || 'Failed to connect Twitter'
          toastError(message)
        }
      }
      window.addEventListener('message', handleEventMessage)

      window.open(url, 'Twitter Login', `width=${width},height=${height},left=${left},top=${top}`)
    } catch (error) {
      const message = getErrorMessage(error)

      if (message !== 'You have already linked a Twitter account.') {
        setStarted(false)
        toastError('Failed to connect Twitter')
      } else {
        toastSuccess('Connected Twitter')
      }
    }
  }

  const handleConnectTelegram = () => {}

  const openModal = useOpenModal(Modals.VERIFY_TWITTER_TASK)

  const handleClick = () => {
    if (shouldVerify) {
      verifyTask()

      return
    }

    setStarted(true)

    if (isConnectTwitterTask(task)) {
      handleConnectTwitter()
      return
    }

    if (isConnectTelegramTask(task)) {
      handleConnectTelegram()
      return
    }

    if (task.action_url) {
      window.open(task.action_url, '_blank', 'noopener')
      const shouldOpenModal =
        (isTwitterTask(task) &&
          TWITTER_ACTIONS.includes(task.action as (typeof TWITTER_ACTIONS)[number])) ||
        isRateExtensionTask(task)

      if (shouldOpenModal) {
        openModal({
          task,
          taskType
        })
        setStarted(false)
        return
      }
    }
  }

  if (task.status === TaskStatus.COMPLETED) {
    return null
  }

  if (shouldVerify || isVerifying) {
    return (
      <SubmitButton className="relative size-full" onClick={handleClick} loading={isVerifying}>
        Verify Now
      </SubmitButton>
    )
  }

  return (
    <button
      className={cn(
        'bg-background relative flex size-full items-center justify-center gap-1 rounded-lg capitalize disabled:opacity-60',
        className
      )}
      onClick={handleClick}
      disabled={shouldDisableTelegramTask || shouldDisableTwitterTask}
      {...props}
    >
      <Icon className="size-4.5" icon="ArrowUpRight" />
      <span className="capitalize">{renderTaskAction(task)}</span>
    </button>
  )
}

const TaskReward = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { task } = useTaskContext()

  const reward = formatNumber(Number(task.reward))

  return (
    <div
      className={cn(
        'flex size-full flex-1 items-center justify-center rounded-lg px-2 leading-normal font-normal md:col-start-2',
        task.status === TaskStatus.COMPLETED
          ? 'bg-secondary-button col-span-2 md:col-span-1'
          : 'bg-accent',
        className
      )}
      {...props}
    >
      <span className="text-16 font-normal text-white/50">+{reward}</span>
      <Token className="mr-3 ml-1 size-4.5" />
      {task.status === TaskStatus.COMPLETED ? (
        <Icon className="size-4.5" icon="Check" />
      ) : (
        <Icon className="size-4.5" icon="Lock" />
      )}
    </div>
  )
}

export {
  isConnectTelegramTask,
  isConnectTwitterTask,
  isDownloadExtensionTask,
  isDownloadTask,
  isLinkTelegramMission,
  isTelegramTask,
  isTwitterTask,
  isUptimeTask,
  renderIcon,
  renderTaskAction,
  Task,
  TaskAction,
  TaskBody,
  TaskContent,
  TaskDescription,
  TaskFooter,
  TaskIcon,
  TaskReward,
  TaskTitle
}
