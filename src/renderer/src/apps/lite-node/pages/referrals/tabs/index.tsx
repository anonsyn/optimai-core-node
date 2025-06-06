import { cn, cx } from '@/utils/tw'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Friends from './friends'
import HowItWorks from './how-it-works'
import Stats from './stats'

const ReferralTabs = () => {
  const [selectedTab, setSelectedTab] = useState('1')

  const tabs = [
    {
      id: '1',
      name: 'Program'
    },
    {
      id: '2',
      name: 'Friends'
    },
    {
      id: '3',
      name: 'Stats'
    }
  ]

  return (
    <div className={cn('pt-3')} data-tabs={selectedTab}>
      <div className="relative flex w-full items-center justify-between gap-3">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.id
          return (
            <motion.button
              key={tab.id}
              className={cx('tab-trigger', isActive && 'tab-trigger--active')}
              data-active={selectedTab === tab.id}
              onClick={() => {
                if (!isActive) {
                  setSelectedTab(tab.id)
                }
              }}
            >
              {tab.name}
              <span className="tab-linear">{tab.name}</span>
              {isActive && (
                <motion.span
                  layoutId="ref-active"
                  transition={{
                    duration: 0.3,
                    ease: 'easeInOut'
                  }}
                  className="bg-main absolute -bottom-1 left-1/2 block h-0.5 w-2 -translate-x-1/2 rounded-sm"
                />
              )}
            </motion.button>
          )
        })}
      </div>
      <div className="pt-4.5">
        {selectedTab === '1' && <HowItWorks />}
        {selectedTab === '2' && <Friends />}
        {selectedTab === '3' && <Stats />}
      </div>
    </div>
  )
}

export default ReferralTabs
