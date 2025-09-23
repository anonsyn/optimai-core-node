import { formatNumber } from '@/utils/number'
import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  delay?: number
}

export const StatsCard = ({ title, value, subtitle, icon, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
        <CardTitle>{title}</CardTitle>
        <CardContent className={icon ? 'items-start' : undefined}>
          <div className="flex items-baseline gap-2">
            {icon && <div className="flex items-center gap-2">{icon}</div>}
            <span className="text-24 font-bold text-white">
              {typeof value === 'number' ? formatNumber(value) : value}
            </span>
            {subtitle && <span className="text-11 text-white/30">{subtitle}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}