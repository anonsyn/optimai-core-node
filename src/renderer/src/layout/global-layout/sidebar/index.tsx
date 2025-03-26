import { Icon, Icons } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@/routers/paths'
import { cn } from '@/utils/tw'
import { Fragment } from 'react'
import { Link, useLocation } from 'react-router'

const Sidebar = () => {
  const tabs = [
    {
      name: 'Browser',
      icon: Icons.Globe,
      href: PATHS.BROWSER,
      separator: true
    },
    {
      name: 'Data Mining',
      icon: Icons.Pickaxe,
      href: PATHS.DATA_MINING
    },
    {
      name: 'Data Validation',
      icon: Icons.Tag,
      href: PATHS.DATA_VALIDATION
    },
    {
      name: 'AI Computing',
      icon: Icons.BrainCircuit,
      href: PATHS.AI_COMPUTING
    }
  ]

  const { pathname } = useLocation()

  return (
    <aside className="h-full w-[var(--sidebar-width)] [--sidebar-width:calc(var(--spacing)*18)]">
      <div className="flex w-full flex-col items-center gap-5 py-5">
        {tabs.map((item, index) => {
          const isActive = pathname.includes(item.href)
          return (
            <Fragment key={index}>
              <Link
                className={cn('relative flex size-12 items-center justify-center')}
                to={item.href}
              >
                <span
                  className={cn(
                    'bg-raydial-10 absolute top-0 left-0 h-full w-[calc((var(--sidebar-width)-100%)/2+100%)] rounded-l-lg opacity-0 transition-opacity',
                    isActive && 'opacity-100'
                  )}
                />
                <Icon className="relative size-6" icon={item.icon} />
              </Link>
              {item.separator && <Separator className="my-1 w-5" />}
            </Fragment>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
