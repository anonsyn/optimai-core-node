import Logo from '@/components/branding/logo'
import { SubmitButton } from '@/components/ui/button'
import { Button, SecondaryText } from '@/components/ui/button/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { InputCustomize, Password } from '@/components/ui/input'
import { toastError, toastSuccess } from '@/components/ui/toast'
import { useAppDispatch } from '@/hooks/redux'
import { useGetCurrentUserQuery } from '@/queries/auth/use-current-user'
import { EXTERNAL_LINKS, PATHS } from '@/routers/paths'
import { authService } from '@/services/auth'
import { authActions } from '@/store/slices/auth'
import { generateCodeChallenge, generateCodeVerifier } from '@/utils/auth'
import { getErrorMessage } from '@/utils/get-error-message'
import { sessionManager } from '@/utils/session-manager'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

const LoginPage = () => {
  return (
    <div className="relative container flex size-full flex-col items-center overflow-hidden py-8 pt-5">
      <div className="absolute top-0 h-12 w-full" />
      <Logo className="h-10" />
      <h1 className="text-28 mt-6 text-center leading-normal font-semibold text-white">
        Welcome to <br /> Optim<span className="font-actual font-normal">AI</span> Network
      </h1>
      <p className="text-14 mt-1 leading-normal text-white/50">Mine Data. Fuel AI. Earn Rewards</p>
      <LoginForm />
    </div>
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

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const getCurrentUserQuery = useGetCurrentUserQuery({
    enabled: false
  })

  const { mutateAsync: signIn, isPending } = useMutation({
    mutationFn: async (formValue: FormValue) => {
      const codeVerifier = await generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      return authService
        .signInV2({
          email: formValue.email,
          password: formValue.password,
          code_challenge_method: 'S256',
          code_challenge: codeChallenge
        })
        .then((res) => {
          const { authorization_code } = res.data

          return authService.exchangeToken({
            code: authorization_code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code'
          })
        })
        .then((res) => {
          const { access_token, refresh_token } = res.data
          return sessionManager.saveTokens(access_token, refresh_token)
        })
        .then(() =>
          getCurrentUserQuery.refetch({
            throwOnError: true
          })
        )
        .then((res) => {
          const user = res.data?.user
          if (!user) {
            throw new Error('No user found')
          }
          return user
        })
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
        navigate(PATHS.HOME)
      })
      .catch((err) => {
        const message = getErrorMessage(err)
        toastError(message)
      })
  }

  const handleNavigateForgotPassword = () => {
    window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.FORGOT_PASSWORD)
  }

  const handleNavigateRegister = () => {
    window.windowIPC.openExternalLink(EXTERNAL_LINKS.DASHBOARD.REGISTER)
  }

  return (
    <div className="mt-8 flex w-full flex-1">
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
            Log In
          </SubmitButton>
          <Button variant="secondary" onClick={handleNavigateRegister}>
            <SecondaryText>Register Now</SecondaryText>
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default LoginPage
