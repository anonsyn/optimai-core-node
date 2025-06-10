import { Icon, Icons } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@core-node/routers/paths'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation } from 'react-router'

const Sidebar = () => {
  const { pathname } = useLocation()
  const navItems = [
    {
      icon: Icons.Globe,
      path: PATHS.BROWSER
    },
    {
      type: 'divider'
    },
    {
      icon: Icons.Pickaxe,
      path: PATHS.DATA_MINING
    },
    {
      icon: Icons.Tag,
      path: PATHS.DATA_VALIDATION
    },
    {
      icon: Icons.BrainCircuit,
      path: PATHS.AI_COMPUTING
    }
  ]

  return (
    <aside className="size-full overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col items-center gap-5 py-5">
        {navItems.map((item, index) => {
          const isDivider = !item.path
          if (isDivider) {
            return <Separator key={index} className="my-1 w-5" />
          }

          const { path, icon } = item as { path: string; icon: any }

          const isActive = pathname.includes(path)

          return (
            <Link
              key={index}
              className="relative flex size-12 items-center justify-center"
              to={path}
            >
              <Icon icon={icon} className="size-6" />
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 60, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-raydial-10 pointer-events-none absolute inset-y-0 -right-3 rounded-l-lg"
                  />
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
