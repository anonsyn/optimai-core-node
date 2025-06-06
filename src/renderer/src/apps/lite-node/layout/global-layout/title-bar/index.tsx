import Clock from './clock'
import Controls from './controls'

const TitleBar = () => {
  return (
    <div className="drag-region absolute inset-x-0 top-0 z-50 flex h-16 w-full items-center justify-between px-4">
      <Controls />
      <Clock />
    </div>
  )
}

export default TitleBar
