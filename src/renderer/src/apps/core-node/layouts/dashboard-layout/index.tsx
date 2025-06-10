import IMAGES from '@/configs/images'
import { Outlet } from 'react-router'
import Sidebar from './sidebar'
import TitleBar from './title-bar'

const DashboardLayout = () => {
  return (
    <div className="size-full">
      <div className="grid size-full grid-cols-1 grid-rows-[5rem_minmax(0,1fr)]">
        <div className="size-full">
          <TitleBar />
        </div>
        <div className="grid size-full grid-cols-[4.5rem_minmax(0,1fr)]">
          <div className="size-full">
            <Sidebar />
          </div>
          <div className="rounded-tl-24 relative size-full overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%), linear-gradient(139deg, rgba(90, 92, 10, 0.01) -35.77%, rgba(113, 115, 13, 0.15) 2.41%, rgba(94, 138, 133, 0.20) 76.44%, rgba(12, 14, 11, 0.50) 111.58%)'
              }}
            >
              <div className="absolute right-full bottom-0 size-100 translate-x-18">
                <img
                  className="absolute top-1/2 left-1/2 h-auto max-h-none w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
                  src={IMAGES.GLOWS.GREEN_GLOW}
                  alt="GREEN"
                />
              </div>

              <div className="absolute top-0 left-full size-100">
                <img
                  className="absolute top-1/2 left-1/2 h-auto max-h-none w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
                  src={IMAGES.GLOWS.YELLOW_GLOW}
                  alt="YELLOW"
                />
              </div>
            </div>
            <main className="size-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
