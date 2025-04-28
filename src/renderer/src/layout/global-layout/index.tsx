import { DefinedGradient } from '@/components/svgs/defined-gradient'
import QueryProvider from '@/providers/query'
import ReduxProvider from '@/providers/redux'
import { PropsWithChildren } from 'react'
import { Outlet } from 'react-router'
import { Toaster } from 'sonner'

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReduxProvider>
      <QueryProvider>{children}</QueryProvider>
    </ReduxProvider>
  )
}

const App = () => {
  return (
    <div className="group relative z-10 h-screen w-screen overflow-x-hidden bg-[#1E1E1E]">
      <div className="bg-main-linear pointer-events-none absolute inset-0">
        <div className="absolute top-[22%] left-full h-30 w-30 -translate-x-1/2 rounded-full bg-[#FFE75C] opacity-30 blur-[100px] group-[&:has([data-global-glow='false'])]:hidden" />
        <div className="absolute bottom-[5%] left-0 h-30 w-30 -translate-x-13 rounded-full bg-[#3EFBAF] opacity-30 blur-[100px] group-[&:has([data-global-glow='false'])]:hidden" />
      </div>
      <div className="relative size-full">
        <Outlet />
      </div>
    </div>
  )
}

const GlobalLayout = () => {
  return (
    <Providers>
      <App />
      <DefinedGradient />
      <Toaster
        richColors
        closeButton
        className="md:![--width:600px] xl:![--width:656px]"
        duration={5000}
        position="bottom-center"
        visibleToasts={1}
      />
    </Providers>
  )
}

export default GlobalLayout
