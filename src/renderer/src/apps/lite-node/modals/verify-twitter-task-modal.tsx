import Token from '@/components/branding/token'
import { isTwitterTask } from '@/components/modules/task'
import { Button, SecondaryText, SubmitButton } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { InputCustomize } from '@/components/ui/input'
import { toastError } from '@/components/ui/toast'
import { useCloseModal, useIsModalOpen, useModal, useUpdateModalData } from '@/hooks/modal'
import { RQUERY as MISSIONS_STATS_RQUERY } from '@/queries/missions/use-get-missions-stats-query'
import {
  useInvalidateMissionsQuery,
  useVerifyTaskMutationFn
} from '@/queries/missions/use-verify-mission-mutation'
import { Mission, missionService, MissionType, TaskStatus } from '@/services/missions'
import { Modals } from '@/store/slices/modals'
import { getErrorMessage } from '@/utils/get-error-message'
import { formatNumber } from '@/utils/number'
import { sleep } from '@/utils/sleep'
import { cn } from '@/utils/tw'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ControllerRenderProps, FieldPath, FieldValues, useForm } from 'react-hook-form'
import { z } from 'zod'

function VerifyTwitterTaskModal() {
  const open = useIsModalOpen(Modals.VERIFY_TWITTER_TASK)
  const closeModal = useCloseModal(Modals.VERIFY_TWITTER_TASK)

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="bg-secondary inset-auto top-1/2 left-1/2 h-auto max-h-[98svh] w-full max-w-[min(92dvw,343px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg !p-0 xl:max-w-[640px]">
        <VerifyForm />
      </DialogContent>
    </Dialog>
  )
}

const schema = z.object({
  url: z.string().url('Invalid URL')
})

type FormValue = z.infer<typeof schema>

const VerifyForm = () => {
  const { data, closeModal } = useModal(Modals.VERIFY_TWITTER_TASK)

  const updateModal = useUpdateModalData(Modals.VERIFY_TWITTER_TASK)

  const { task, taskType } = data

  const isServerVerifying = task.status === TaskStatus.VERIFYING

  const [shouldRefetch, setShouldRefetch] = useState(isServerVerifying)
  const [isVerifying, setIsVerifying] = useState(isServerVerifying)

  const form = useForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: ''
    }
  })

  const queryClient = useQueryClient()

  const invalidateMissionsQuery = useInvalidateMissionsQuery(taskType)

  const verifyTaskMutationFn = useVerifyTaskMutationFn(task, taskType)

  const handleTaskFetched = (task: Mission) => {
    updateModal({
      ...data,
      task
    })
    const isVerifying = task.status === TaskStatus.VERIFYING

    setIsVerifying(isVerifying)
    setShouldRefetch(isVerifying)
    const isError = task.status === TaskStatus.FAILED && task.failure_reason
    if (isError) {
      const message = task.failure_reason
      if (message) {
        toastError(message, {
          id: task.id
        })
      }
      invalidateMissionsQuery()
      closeModal()
    }

    const isSuccess = task.status === TaskStatus.COMPLETED
    if (isSuccess) {
      invalidateMissionsQuery()
      queryClient.invalidateQueries({ queryKey: MISSIONS_STATS_RQUERY() })
      closeModal()
    }
  }

  const getMissions = (id: string) => {
    if (taskType === MissionType.COMMUNITY) {
      return missionService.getCommunityMissionById(id)
    }

    if (taskType === MissionType.ENGAGEMENT) {
      return missionService.getEngagementMissionById(id)
    }

    return missionService.getNetworkMissionById(id)
  }

  const { mutateAsync: verifyTask } = useMutation({
    mutationFn: async (url: string) => {
      const request = isTwitterTask(task) ? { tweet_url: url } : { review_url: url }
      return verifyTaskMutationFn(request)
        .then(() => {
          invalidateMissionsQuery()
        })
        .then(() => {
          return getMissions(task.id) as any
        })
        .then((res) => {
          const task = res.data
          return handleTaskFetched(task)
        })
        .then(() => {
          return sleep(100)
        })
    }
  })

  const handleSubmit = async (formValue: FormValue) => {
    const { url } = formValue
    setIsVerifying(true)
    return verifyTask(url).catch((error) => {
      setIsVerifying(false)
      setShouldRefetch(false)

      const message = getErrorMessage(error, 'Failed to verify task')
      form.setError('url', {
        message
      })
    })
  }

  const placeholder = isTwitterTask(task) ? 'Tweet URL' : 'Review URL'

  useEffect(() => {
    if (shouldRefetch) {
      let mounted = true
      console.log('Start refetching')
      const id = setInterval(() => {
        getMissions(task.id).then((res) => {
          if (!mounted) {
            return
          }
          const task = res.data
          handleTaskFetched(task)
        })
      }, 5000)

      return () => {
        clearInterval(id)
        mounted = false
        console.log('Stop refetching')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefetch])

  return (
    <div>
      <div className="p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <DialogTitle className="text-18 md:text-20 line-clamp-2 text-start leading-normal font-semibold tracking-tight text-white">
              {task.title.replace(/#\d+/, '')}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <span className="text-16 font-normal">+{formatNumber(Number(task.reward))}</span>
              <Token className="size-4.5" />
            </div>
          </div>
          <DialogDescription className="text-14 xl:text-16 line-clamp-2 text-start leading-normal tracking-tight break-words text-white">
            {task.description}
          </DialogDescription>
        </div>
        <Form {...form}>
          <form
            id="verify-twitter-task-form"
            className="pt-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem autoAnimate={false}>
                  <FormControl>
                    <InputWithTruncation
                      field={field}
                      verifying={isVerifying}
                      placeholder={placeholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="w-full space-y-3 border-t p-4">
        <SubmitButton className="w-full" form="verify-twitter-task-form" disabled={isVerifying}>
          Submit
        </SubmitButton>
        <Button className="w-full" variant="secondary" onClick={closeModal}>
          <SecondaryText>Back to Dashboard</SecondaryText>
        </Button>
      </div>
    </div>
  )
}

interface InputWithTruncationProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  field: ControllerRenderProps<TFieldValues, TName>
  verifying: boolean
  [key: string]: any
}

const InputWithTruncation = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  verifying,
  ...props
}: InputWithTruncationProps<TFieldValues, TName>) => {
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const truncateMiddle = (text: string, maxLength: number = 24): string => {
    if (!text || text.length <= maxLength) return text

    const startChars = Math.floor(maxLength / 2)
    const endChars = maxLength - startChars - 1

    return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`
  }

  return (
    <InputCustomize
      startIcon={<Icon icon="SquarePen" />}
      placeholder="Tweet URL"
      inputClassName={cn(verifying && 'pr-[116px]')}
      onFocus={(e) => {
        setIsFocused(true)
        sleep(10).then(() => {
          // e.target.selectionStart = e.target.value.length
          // e.target.selectionEnd = e.target.value.length
          e.target.select()
        })
      }}
      onBlur={() => {
        setIsFocused(false)
        field.onBlur()
      }}
      value={isFocused ? field.value : truncateMiddle(field.value || '')}
      onChange={field.onChange}
      name={field.name}
      ref={field.ref}
      endIcon={
        <>
          {verifying && (
            <div className="flex items-center gap-1 text-[#CDB150]">
              <Icon
                className="size-4.5 origin-center animate-spin duration-[4s]"
                icon="Hourglass"
              />
              <span className="text-16 font-normal">Verifying</span>
            </div>
          )}
        </>
      }
      {...props}
    />
  )
}

export default VerifyTwitterTaskModal
