import ArrowLeft from '@assets/icons/arrow-left.svg?react'
import BrainCircuit from '@assets/icons/brain-circuit.svg?react'
import Check from '@assets/icons/check.svg?react'
import CircleCheck from '@assets/icons/circle-check.svg?react'
import Copy from '@assets/icons/copy.svg?react'
import CPU from '@assets/icons/cpu.svg?react'
import EyeOff from '@assets/icons/eye-off.svg?react'
import Eye from '@assets/icons/eye.svg?react'
import Funnel from '@assets/icons/funnel.svg?react'
import Globe from '@assets/icons/globe.svg?react'
import GPU from '@assets/icons/gpu.svg?react'
import Info from '@assets/icons/info.svg?react'
import List from '@assets/icons/list.svg?react'
import LoaderCircle from '@assets/icons/loader-circle.svg?react'
import Lock from '@assets/icons/lock.svg?react'
import Mail from '@assets/icons/mail.svg?react'
import MemoryStick from '@assets/icons/memory-stick.svg?react'
import Minus from '@assets/icons/minus.svg?react'
import Monitor from '@assets/icons/monitor.svg?react'
import PanelRightOpen from '@assets/icons/panel-right-open.svg?react'
import Pickaxe from '@assets/icons/pickaxe.svg?react'
import SSD from '@assets/icons/ssd.svg?react'
import Tag from '@assets/icons/tag.svg?react'
import X from '@assets/icons/x.svg?react'

import { SVGProps } from 'react'

export const Icons = {
  BrainCircuit,
  CircleCheck,
  Copy,
  CPU,
  Funnel,
  Globe,
  GPU,
  List,
  MemoryStick,
  Minus,
  Monitor,
  PanelRightOpen,
  Pickaxe,
  SSD,
  Tag,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  LoaderCircle,
  Check,
  Info,
  ArrowLeft
} as const

export type IconName = keyof typeof Icons

export interface IconProps extends SVGProps<SVGSVGElement> {
  icon: IconName | (typeof Icons)[IconName]
}

export const Icon = ({ icon, ...props }: IconProps) => {
  const IconComponent = typeof icon === 'string' ? Icons[icon] : icon

  return <IconComponent {...props} />
}
