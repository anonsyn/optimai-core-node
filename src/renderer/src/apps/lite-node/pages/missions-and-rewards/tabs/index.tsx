import { cx } from '@/utils/tw'
import { motion } from 'framer-motion'
import { useState } from 'react'
import MissionsTab from './missions'
import ReferralsTabs from './referrals-tasks'

const TaskTabs = () => {
  const [selectedTab, setSelectedTab] = useState('1')

  const tabs = [
    {
      id: '1',
      name: 'Missions'
    },
    {
      id: '2',
      name: 'Referrals'
    }
  ]

  return (
    <div className="size-full [&:has([data-expand='true'])]:grid [&:has([data-expand='true'])]:grid-cols-1 [&:has([data-expand='true'])]:grid-rows-[auto_minmax(0,1fr)]">
      <div className="relative flex w-full items-center gap-3">
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
                  layoutId="tasks-active"
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
      <div className="pt-4.5 [&:has([data-expand='true'])]:h-full">
        {selectedTab === '1' && <MissionsTab />}
        {selectedTab === '2' && <ReferralsTabs />}
      </div>
    </div>
  )
}

export default TaskTabs
