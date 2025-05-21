import Clock from './clock'
import Controls from './controls'

const TitleBar = () => {
  return (
    <div className="drag-region relative z-50 flex size-full items-center justify-between px-4">
      <Controls />
      <Clock />
    </div>
  )
}

export default TitleBar
