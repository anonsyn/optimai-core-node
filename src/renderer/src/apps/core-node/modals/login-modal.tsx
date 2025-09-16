import { Button, SubmitButton } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { InputCustomize, Password } from '@/components/ui/input'
import { toastError, toastSuccess } from '@/components/ui/toast'
import { EXTERNAL_LINKS } from '@/configs/links'
import { useCloseModal, useIsModalOpen, useModalData } from '@/hooks/modal'
import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { authActions } from '@/store/slices/auth'
import { Modals } from '@/store/slices/modals'
import { getErrorMessage } from '@/utils/get-error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

function LoginModal() {
  const open = useIsModalOpen(Modals.LOGIN)

  return (
    <Dialog open={open}>
      <DialogContent className="flex min-h-[min(70svh,414px)] flex-col overflow-auto md:min-h-[min(70svh,520px)]">
        <DialogHeader>
          <DialogTitle className="text-28">Login</DialogTitle>
          <DialogDescription className="text-16 font-normal text-white/80">
            Don&apos;t have an account?&nbsp;
            <a
              className="webkit-text-clip bg-main bg-clip-text font-medium"
              href={EXTERNAL_LINKS.DASHBOARD.REGISTER}
              target="_blank"
              rel="noreferrer"
            >
              Register Now
            </a>
          </DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  )
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' })
})

type FormValue = z.infer<typeof signInSchema>

const LoginForm = () => {
  const form = useForm<FormValue>({
    mode: 'all',
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const dispatch = useAppDispatch()

  const { onSuccess } = useModalData(Modals.LOGIN)

  const closeModal = useCloseModal(Modals.LOGIN)

  const getCurrentUserQuery = useGetCurrentUserQuery({
    enabled: false
  })

  const { mutateAsync: signIn, isPending } = useMutation({
    mutationFn: async (formValue: FormValue) => {
      // Use IPC to handle login through the API server
      const tokens = await window.nodeIPC.loginApi(formValue.email, formValue.password)

      if (!tokens || !tokens.access_token) {
        throw new Error('Login failed - no tokens received')
      }

      // After successful login, get the user data
      const res = await getCurrentUserQuery.refetch({
        throwOnError: true
      })

      const user = res.data?.user
      if (!user) {
        throw new Error('No user found')
      }

      return user
    }
  })

  const handleSubmit = async (formValue: FormValue) => {
    return signIn(formValue)
      .then((user) => {
        dispatch(authActions.setUser(user))
      })
      .then(() => {
        return window.nodeIPC.startNode()
      })
      .then(() => {
        toastSuccess('Login successful')
        onSuccess?.()
        closeModal()
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        toastError(message)
      })
  }

  const handleNavigateForgotPassword = () => {
    window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.FORGOT_PASSWORD)
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
                  <InputCustomize
                    startIcon={<Icon className="size-6" icon="Mail" />}
                    placeholder="Email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Password
                    startIcon={<Icon className="size-6" icon="Lock" />}
                    placeholder="Password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="h-8 min-h-0 self-end !p-0 font-normal underline underline-offset-2 transition-opacity hover:opacity-60"
            variant="link"
            onClick={handleNavigateForgotPassword}
          >
            Forgot password
          </Button>
          <SubmitButton className="mt-auto" loading={isPending}>
            Access My Account
          </SubmitButton>
        </form>
      </Form>
    </div>
  )
}

export default LoginModal
