import { cn } from '@/utils/tw'
import ArrowLeft from '@assets/icons/arrow-left.svg?react'
import ArrowUpRight from '@assets/icons/arrow-up-right.svg?react'
import BrainCircuit from '@assets/icons/brain-circuit.svg?react'
import Calendar from '@assets/icons/calendar.svg?react'
import Check from '@assets/icons/check.svg?react'
import ChevronLeft from '@assets/icons/chevron-left.svg?react'
import ChevronRight from '@assets/icons/chevron-right.svg?react'
import CircleCheck from '@assets/icons/circle-check.svg?react'
import Copy from '@assets/icons/copy.svg?react'
import CPU from '@assets/icons/cpu.svg?react'
import DataOperatorFilled from '@assets/icons/data-operator-filled.svg?react'
import DataOperatorOutlined from '@assets/icons/data-operator-outlined.svg?react'
import Extension from '@assets/icons/extension.svg?react'
import EyeOff from '@assets/icons/eye-off.svg?react'
import Eye from '@assets/icons/eye.svg?react'
import Fire from '@assets/icons/fire.svg?react'
import Funnel from '@assets/icons/funnel.svg?react'
import Globe from '@assets/icons/globe.svg?react'
import GPU from '@assets/icons/gpu.svg?react'
import Hexagon from '@assets/icons/hexagon.svg?react'
import Info from '@assets/icons/info.svg?react'
import List from '@assets/icons/list.svg?react'
import LoaderCircle from '@assets/icons/loader-circle.svg?react'
import LockOpen from '@assets/icons/lock-open.svg?react'
import Lock from '@assets/icons/lock.svg?react'
import Mail from '@assets/icons/mail.svg?react'
import MemoryStick from '@assets/icons/memory-stick.svg?react'
import Minus from '@assets/icons/minus.svg?react'
import Monitor from '@assets/icons/monitor.svg?react'
import NodeOperatorFilled from '@assets/icons/node-operator-filled.svg?react'
import NodeOperatorOutlined from '@assets/icons/node-operator-outlined.svg?react'
import PanelRightOpen from '@assets/icons/panel-right-open.svg?react'
import Pickaxe from '@assets/icons/pickaxe.svg?react'
import RefFilled from '@assets/icons/ref-filled.svg?react'
import RefOutlined from '@assets/icons/ref-outlined.svg?react'
import Sad from '@assets/icons/sad.svg?react'
import SSD from '@assets/icons/ssd.svg?react'
import Tag from '@assets/icons/tag.svg?react'
import TaskFilled from '@assets/icons/task-filled.svg?react'
import TaskOutlined from '@assets/icons/task-outlined.svg?react'
import Telegram from '@assets/icons/telegram.svg?react'
import Timer from '@assets/icons/timer.svg?react'
import Twitter from '@assets/icons/twitter.svg?react'
import Users from '@assets/icons/users.svg?react'
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
  ArrowLeft,
  TaskOutlined,
  TaskFilled,
  NodeOperatorOutlined,
  NodeOperatorFilled,
  DataOperatorOutlined,
  DataOperatorFilled,
  RefOutlined,
  RefFilled,
  Hexagon,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  Sad,
  Fire,
  LockOpen,
  ArrowUpRight,
  Twitter,
  Telegram,
  Extension,
  Timer
} as const

export type IconName = keyof typeof Icons

export interface IconProps extends SVGProps<SVGSVGElement> {
  icon: IconName | (typeof Icons)[IconName]
}

export const Icon = ({ icon, className, ...props }: IconProps) => {
  const IconComponent = typeof icon === 'string' ? Icons[icon] : icon

  return <IconComponent className={cn('size-6', className)} {...props} />
}
