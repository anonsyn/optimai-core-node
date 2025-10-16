import { authApi } from '@/api/auth'
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
import { sessionManager } from '@/utils/session-manager'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

function LoginModal() {
  const open = useIsModalOpen(Modals.LOGIN)

  return (
    <Dialog open={open}>
      <DialogContent className="flex min-h-[min(70svh,414px)] flex-col overflow-auto md:min-h-[min(70svh,520px)]">
        <DialogHeader>
          <DialogTitle className="text-28">Sign in</DialogTitle>
          <DialogDescription className="text-16 font-normal text-white/80">
            Don’t have an account?&nbsp;
            <a
              className="webkit-text-clip bg-main bg-clip-text font-medium"
              href={EXTERNAL_LINKS.DASHBOARD.REGISTER}
              target="_blank"
              rel="noreferrer"
            >
              Create account
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
  const [loading, setLoading] = useState(false)
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

  const { mutateAsync: signIn } = useMutation({
    mutationFn: async (formValue: FormValue) => {
      const { verifier, challenge } = await generatePkceChallenge()

      const signInResponse = await authApi.signInV2({
        email: formValue.email,
        password: formValue.password,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      })

      const tokenResponse = await authApi.exchangeToken({
        grant_type: 'authorization_code',
        code: signInResponse.data.authorization_code,
        code_verifier: verifier
      })

      const { access_token: accessToken, refresh_token: refreshToken } = tokenResponse.data

      if (!accessToken || !refreshToken) {
        throw new Error('No tokens received from server')
      }

      await sessionManager.setTokens(accessToken, refreshToken)

      const res = await getCurrentUserQuery.refetch({
        throwOnError: true
      })

      const user = res.data?.user
      if (!user) {
        throw new Error('No user found')
      }

      await sessionManager.setUser(user)

      return user
    }
  })

  const handleSubmit = async (formValue: FormValue) => {
    setLoading(true)
    return signIn(formValue)
      .then((user) => {
        dispatch(authActions.setUser(user))
      })
      .then(() => {
        return window.nodeIPC.startNode()
      })
      .then(() => {
        toastSuccess('Signed in')
        onSuccess?.()
        closeModal()
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        toastError(message)
      })
      .finally(() => {
        setLoading(false)
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
          <SubmitButton className="mt-auto" loading={loading}>
            Sign in
          </SubmitButton>
        </form>
      </Form>
    </div>
  )
}

export default LoginModal

const base64UrlEncode = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const generatePkceChallenge = async () => {
  const verifierBytes = new Uint8Array(32)
  crypto.getRandomValues(verifierBytes)
  const verifier = base64UrlEncode(verifierBytes)

  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const challenge = base64UrlEncode(new Uint8Array(digest))

  return { verifier, challenge }
}
