import ControlButton from './control-button'

const Controls = () => {
  const controls = [
    {
      label: 'Minimize'
    },
    {
      label: 'Maximize'
    },
    {
      label: 'Close'
    }
  ]

  return (
    <div className="flex items-center gap-2">
      {controls.map((control, index) => {
        return <ControlButton key={index} label={control.label} />
      })}
    </div>
  )
}

export default Controls
