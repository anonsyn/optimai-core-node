import { formatNumber } from '@/utils/number'
import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: ReactNode
  delay?: number
}

export const StatsCard = ({ title, value, unit, icon, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card>
        <CardTitle>{title}</CardTitle>
        <CardContent className={icon ? 'items-start' : undefined}>
          <div className="flex items-center gap-2">
            {icon && <div className="flex items-center gap-2">{icon}</div>}
            <span className="text-28 leading-none font-bold text-white">
              {typeof value === 'number' ? formatNumber(value) : value}
            </span>
            {unit && <span className="text-12 self-end text-white/30">{unit}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
