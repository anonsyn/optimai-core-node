import { Button, SubmitButton } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input/textarea'
import { toastError, toastSuccess } from '@/components/ui/toast'
import { EXTERNAL_LINKS } from '@/configs/links'
import { useCloseModal, useIsModalOpen } from '@/hooks/modal'
import { useAppSelector } from '@/hooks/redux'
import { authSelectors } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { getErrorMessage } from '@/utils/get-error-message'

function ReportIssueModal() {
  const open = useIsModalOpen(Modals.REPORT_ISSUE)
  const closeModal = useCloseModal(Modals.REPORT_ISSUE)

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="flex flex-col overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-20">Report an Issue</DialogTitle>
          <DialogDescription className="text-16 font-normal text-white/50">
            This form is for reporting bugs only. For help or guidance, please visit our support
            site&nbsp;
            <a
              className="text-white/80 underline"
              href={EXTERNAL_LINKS.HOME}
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
          </DialogDescription>
        </DialogHeader>
        <ReportForm />
      </DialogContent>
    </Dialog>
  )
}

const reportIssueSchema = z.object({
  email: z.string().email(),
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' })
})

type FormValue = z.infer<typeof reportIssueSchema>

const ReportForm = () => {
  const user = useAppSelector(authSelectors.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValue>({
    mode: 'all',
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      email: user?.email || '',
      title: '',
      description: ''
    }
  })

  const closeModal = useCloseModal(Modals.REPORT_ISSUE)

  const handleSubmit = async (formValue: FormValue) => {
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      if (!window.reportsIPC) {
        throw new Error('Report submission channel is unavailable')
      }

      const response = await window.reportsIPC.submit(formValue)

      if (!response.success) {
        setSubmitError(response.error)
        toastError(response.error)
        return
      }

      toastSuccess(`Report submitted. ID: ${response.result.reportId}`)
      form.reset({
        email: user?.email || '',
        title: '',
        description: ''
      })
      closeModal()
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to submit bug report')
      setSubmitError(message)
      toastError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8 grid w-full flex-1">
      <Form {...form}>
        <form
          id="sign-in-form"
          className="flex size-full flex-col gap-3"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea className="h-[100px]" placeholder="Issue Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError ? (
            <p className="text-14 text-destructive/80">{submitError}</p>
          ) : null}

          <p className="text-13 text-white/50">
            Logs from this device are attached automatically to help troubleshoot issues.
          </p>

          <div className="flex flex-col gap-2 pt-15">
            <SubmitButton loading={isSubmitting}>Send</SubmitButton>
            <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ReportIssueModal
