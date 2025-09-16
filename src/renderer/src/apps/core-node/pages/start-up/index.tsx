import Logo from '@/components/branding/logo'
import LoginModal from '@core-node/modals/login-modal'
import CanvasGlow from '@core-node/pages/start-up/canvas-glow'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef } from 'react'
import { StartupProvider } from './provider'
import RoundedBoxLine from './rounded-box-line'
import Status from './status'
import TopBar from './top-bar'
import WaveVisualizer from './wave-visualizer'

const StartUpPage = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
      timeline
        .to('#logo', {
          opacity: 1.15,
          duration: 1.15
        })
        .to(
          '.box-line',
          {
            width: '100%',
            opacity: 0.5,
            duration: 0.3
          },
          0.5
        )
        .to(
          '.box-line__top',
          {
            top: 0,
            yPercent: 0,
            opacity: 1,
            duration: 0.35
          },
          '>'
        )
        .to(
          '.box-line__bottom',
          {
            top: '100%',
            yPercent: -100,
            opacity: 1,
            duration: 0.35
          },
          '<'
        )
        .to(
          '.glow',
          {
            opacity: 0.35,
            duration: 0.8
          },
          '<'
        )
        .to(
          '.top-bar',
          {
            opacity: 0.5,
            duration: 0.35
          },
          '<'
        )
        .to(
          '.top-bar__background',
          {
            width: '100%',
            ease: 'linear',
            duration: 0.35,
            delay: 0.2
          },
          '<'
        )
        .to(
          '.top-bar',
          {
            opacity: 1,
            duration: 0.35
          },
          '>'
        )
        .to(
          '.top-bar__decorator',
          {
            opacity: 1,
            duration: 0.25
          },
          '>'
        )
        .to(
          '.node-status',
          {
            opacity: 1,
            duration: 0.35
          },
          '>'
        )
    },
    {
      scope: containerRef
    }
  )

  return (
    <StartupProvider>
      <div
        ref={containerRef}
        className="relative size-full overflow-hidden px-17 pt-11 pb-19 select-none"
      >
        <div className="drag-region absolute inset-x-0 top-0 h-25" />
        <div className="relative size-full">
          <div
            id="decorator-top"
            className="box-line box-line__top pointer-events-none absolute top-1/2 left-1/2 flex h-17 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-between opacity-0"
          >
            <RoundedBoxLine />
            <RoundedBoxLine dir="ltr" />
          </div>
          <div className="top-bar absolute top-0 left-1/2 h-17 w-[calc(100%-25rem)] -translate-x-1/2 opacity-0">
            <TopBar />
          </div>

          <Logo
            id="logo"
            className="absolute top-1/2 left-1/2 h-[min(120px,11.125vh)] -translate-x-1/2 -translate-y-1/2 opacity-0"
          />
          <div className="box-line box-line__bottom pointer-events-none absolute top-1/2 left-1/2 flex h-9 w-50 -translate-x-1/2 -translate-y-1/2 items-center justify-between opacity-0">
            <RoundedBoxLine />
            <RoundedBoxLine dir="ltr" />
          </div>
          <div className="node-status absolute bottom-0 left-1/2 h-9 w-[calc(100%-25rem)] -translate-x-1/2 opacity-0">
            <Status />
          </div>
        </div>
        <div className="glow pointer-events-none absolute inset-0 opacity-0">
          <CanvasGlow />
        </div>
        <WaveVisualizer />
        <LoginModal />
      </div>
    </StartupProvider>
  )
}

export default StartUpPage
