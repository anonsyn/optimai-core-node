import Background from './background'
import DayReward from './day-reward'
import Nav from './nav'
import TotalReward from './total-reward'
import Uptime from './uptime'

const GlobalHeader = () => {
  return (
    <header className="relative w-full overflow-hidden pb-6">
      <Background />
      <div className="relative z-10 flex size-full flex-col gap-2">
        <Nav />
        <div className="flex flex-col gap-2 px-4">
          <Uptime />
          <div className="flex items-center gap-2">
            <TotalReward />
            <DayReward />
          </div>
        </div>
      </div>
    </header>
  )
}

export default GlobalHeader
