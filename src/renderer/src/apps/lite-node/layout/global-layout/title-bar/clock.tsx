import { padStart } from '@/utils/format-number'
import { useEffect, useState } from 'react'
const getCurrentTime = () => {
  const date = new Date()

  return {
    date: padStart(date.getDate(), 2),
    month: padStart(date.getMonth(), 2),
    year: date.getFullYear(),
    hour: padStart(date.getHours(), 2),
    minute: padStart(date.getMinutes(), 2),
    second: padStart(date.getSeconds(), 2)
  }
}

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-14 bg-secondary/50 flex h-8 items-center rounded-md p-2 leading-normal text-white/50">
      <span className="tabular-nums">{currentTime.date}</span>/
      <span className="tabular-nums">{currentTime.month}</span>/
      <span className="tabular-nums">{currentTime.year}</span>&nbsp;•&nbsp;
      <span className="tabular-nums">{currentTime.hour}</span>:
      <span className="tabular-nums">{currentTime.minute}</span>:
      <span className="tabular-nums">{currentTime.second}</span>
    </div>
  )
}

export default Clock
