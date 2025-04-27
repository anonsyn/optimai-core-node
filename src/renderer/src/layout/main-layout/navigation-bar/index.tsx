import { PiSvg } from '@/components/branding/pi'
import { Icon } from '@/components/ui/icon'
import { PATHS } from '@/routers/paths'
import { cn } from '@/utils/tw'
import { useLocation, useNavigate } from 'react-router'
import NavButton from './nav-button'

const NavigationBar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // const uptimeCount = useAppSelector(notificationSelectors.uptimeCount)
  // const proxyCount = useAppSelector(notificationSelectors.proxyCount)

  // const dispatch = useAppDispatch()

  const clearUptimeCount = () => {
    // dispatch(notificationActions.resetUptimeCount())
  }

  const clearProxyCount = () => {
    // dispatch(notificationActions.resetProxyCount())
  }

  const navs = [
    {
      name: 'Missions & Rewards',
      path: PATHS.MISSIONS_REWARDS,
      icon: <Icon icon="TaskOutlined" />,
      activeIcon: <Icon icon="TaskFilled" />
    },
    {
      name: 'Node Operator',
      path: PATHS.NODE_OPERATOR,
      icon: <Icon icon="NodeOperatorOutlined" />,
      activeIcon: <Icon icon="NodeOperatorFilled" />,
      notification: 0,
      clearNotification: clearUptimeCount
    },
    {
      name: 'Home',
      path: PATHS.HOME,
      icon: <PiSvg className="text-foreground translate-x-px opacity-50" />,
      activeIcon: <PiSvg className="text-muted translate-x-px" />
    },
    {
      name: 'Data Operator',
      path: PATHS.DATA_OPERATOR,
      icon: <Icon icon="DataOperatorOutlined" />,
      activeIcon: <Icon icon="DataOperatorFilled" />,
      notification: 0,
      clearNotification: clearProxyCount
    },
    {
      name: 'Reference',
      path: PATHS.REF,
      icon: <Icon icon="RefOutlined" />,
      activeIcon: <Icon icon="RefFilled" />
    }
  ]

  const handleNavClick = (item: (typeof navs)[number]) => {
    const isActive = pathname === item.path
    if (!isActive) {
      navigate(item.path, {
        replace: true
      })
      item.clearNotification?.()
    }
  }

  return (
    <nav
      className={cn('backdrop-blur-10 w-full bg-[#212925] px-3 py-2')}
      style={{
        boxShadow: '0px 6px 24px 0px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="flex h-14 w-full items-center justify-between lg:justify-evenly">
        {navs.map((item, index) => {
          return (
            <NavButton
              key={index}
              aria-label={item.name}
              active={pathname.includes(item.path)}
              icon={item.icon}
              activeIcon={item.activeIcon}
              onClick={() => handleNavClick(item)}
              notification={item.notification}
            />
          )
        })}
      </div>
    </nav>
  )
}

export default NavigationBar
