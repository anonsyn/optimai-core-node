import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface DataDistributionProps {
  data: {
    video: number
    text: number
    image: number
    audio: number
  }
}

const COLORS = {
  text: '#5EED87', // green
  image: '#F6F655', // yellow
  video: '#F6F655B3', // main with opacity
  audio: '#A855F7' // purple
}

export const DataDistributionChart = ({ data }: DataDistributionProps) => {
  const hasAnyData = Object.values(data).some((value) => value > 0)

  // Prepare data for recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value),
    color: COLORS[name as keyof typeof COLORS]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-white/10 bg-black/90 p-2 backdrop-blur">
          <p className="text-12 font-medium text-white">
            {payload[0].name}: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy }: any) => {
    const total = Math.round(Object.values(data).reduce((a, b) => a + b, 0))
    return (
      <text
        x={cx}
        y={cy}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="pointer-events-none"
      >
        <tspan fontSize="18" fontWeight="semibold" x={cx} dy="-0.1em">
          {total}%
        </tspan>
        <tspan fontSize="10" fill="rgba(255,255,255,0.4)" x={cx} dy="1.5em">
          Total
        </tspan>
      </text>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Card className="relative overflow-hidden border-white/5 bg-white/[0.02]">
        <CardTitle>Data Distribution</CardTitle>
        <CardContent>
          {hasAnyData ? (
            <div className="flex flex-col gap-4 [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none">
              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={65}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ outline: 'none' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="text-11 grid grid-cols-2 gap-x-3 gap-y-2">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-12 text-white/60">{item.name}</span>
                    <span className="text-12 ml-auto text-white/80">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <span className="text-12 text-white/40">No data collected yet</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
