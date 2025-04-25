import { loadingLottieData } from '@/assets/lotties/loading'
import Logo from '@/components/branding/logo'
import Lottie from 'lottie-react'

const StartUpPage = () => {
  return (
    <div className="absolute inset-0 size-full overflow-hidden">
      <div className="absolute inset-0">
        <div className="bg-main-linear backdrop-blur-50 absolute inset-0" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 size-20 rounded-full bg-[#DBF075] opacity-30 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-20 rounded-full bg-[#3EFBAF] opacity-30 blur-3xl" />
          <div className="absolute top-full left-1/2 size-40 -translate-x-1/2 rounded-full bg-[#D9D9D9] opacity-30 blur-3xl" />
        </div>
      </div>
      <div className="absolute inset-0 flex size-full flex-col items-center justify-between px-4 pt-8">
        <Logo className="h-10" />
        <div className="flex flex-col items-center pb-8">
          <p className="text-10 leading-relaxed text-white/50">Version {APP_VERSION}</p>
          <p className="text-12 leading-relaxed text-white/80">© OptimAI Network</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pt-44 pb-51">
          <div className="pointer-events-none relative mt-3 size-[18.75rem]">
            <HomeNode />
          </div>
        </div>
      </div>
    </div>
  )
}

const HomeNode = () => {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-1 size-[300px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.8]">
      <div>
        <div
          className="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)',
            background: 'rgba(36, 41, 38, 0.05)'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)',
            background: 'rgba(36, 41, 38, 0.05)'
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            border: '1px solid rgba(209, 209, 209, 0.02)',
            // background: "rgba(36, 41, 38, 0.05)",
            maskRepeat: 'no-repeat',
            maskImage:
              'radial-gradient(circle, black 50%, transparent 51%), linear-gradient(black, black)',
            maskComposite: 'exclude',
            maskPosition: '50% 50%, 0 0',
            maskSize: '416px 416px, 100% 100%'
          }}
        >
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '236px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '299px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
          <div
            className="absolute h-0.5 w-full bg-[#2E312E]"
            style={{
              top: '361px',
              backgroundImage: 'linear-gradient(180deg, #000 0%, rgba(128, 128, 128, 0.00) 100%)'
            }}
          />
        </div>
        <Lottie
          className="absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2"
          animationData={loadingLottieData}
          loop
        />
      </div>
    </div>
  )
}

export default StartUpPage
