import Logo from '@/components/branding/logo'
import { SubmitButton } from '@/components/ui/button'
import { Button, SecondaryText } from '@/components/ui/button/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { InputCustomize, Password } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const LoginPage = () => {
  return (
    <div className="relative container flex size-full flex-col items-center overflow-hidden py-8 pt-5">
      <div className="drag-region absolute top-0 h-12 w-full" />
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
    resolver: zodResolver(signInSchema)
  })

  const handleSubmit = (data: FormValue) => {
    console.log(data)
  }

  const handleNavigateForgotPassword = () => {
    console.log('forgot password')
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
          <SubmitButton className="mt-auto">Log In</SubmitButton>
          <Button variant="secondary">
            <SecondaryText>Register Now</SecondaryText>
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default LoginPage
