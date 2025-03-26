import { Icon, Icons } from '@/components/ui/icon'
import ControlButton from './control-button'

const Controls = () => {
  const controls = [
    {
      label: 'Minimize',
      icon: Icons.Minus
    },
    {
      label: 'Maximize',
      icon: Icons.Copy
    },
    {
      label: 'Close',
      icon: Icons.X
    }
  ]

  return (
    <div className="flex items-center gap-8">
      {controls.map((control, index) => {
        return (
          <ControlButton key={index} aria-label={control.label}>
            <Icon className="size-6" icon={control.icon} />
          </ControlButton>
        )
      })}
    </div>
  )
}

export default Controls
