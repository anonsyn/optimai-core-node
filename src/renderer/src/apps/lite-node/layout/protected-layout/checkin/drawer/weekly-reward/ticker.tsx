import Token from '@/components/branding/token'
import { cn } from '@/utils/tw'
import {
  animate,
  AnimatePresence,
  AnimationPlaybackControls,
  motion,
  MotionValue,
  useMotionValue
} from 'framer-motion'
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface TickerProps {
  reward?: number
  onComplete?: () => void
}

const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const Ticker = ({ reward, onComplete }: TickerProps) => {
  const [targetDigits, setTargetDigits] = useState<number[]>([0, 0, 0])
  const [completeDigits, setCompleteDigits] = useState([false, false, false])

  const isAllComplete = useMemo(() => {
    return completeDigits.every((d) => d)
  }, [completeDigits])

  const performDigits = useCallback((reward: number) => {
    if (reward) {
      const digits = reward.toString().padStart(3, '0').split('')
      setTargetDigits(digits.map((d) => parseInt(d)))
    } else {
      setTargetDigits([0, 0, 0])
    }
  }, [])

  console.log({ targetDigits, reward })

  useEffect(() => {
    performDigits(reward || 0)
  }, [reward, performDigits])

  const isReady = reward && reward !== 0

  const num1YMotionValue = useMotionValue(0)
  const num2YMotionValue = useMotionValue(0)
  const num3YMotionValue = useMotionValue(0)

  const num1AnimControl = useRef<AnimationPlaybackControls>(null)
  const num2AnimControl = useRef<AnimationPlaybackControls>(null)
  const num3AnimControl = useRef<AnimationPlaybackControls>(null)

  const performAnimation = useCallback(() => {
    if (!isReady) return
    setCompleteDigits([false, false, false])
    const digit1 = targetDigits[0]
    const digit2 = targetDigits[1]
    const digit3 = targetDigits[2]

    const durationPerRound = 0.2
    const digitsHeight = 90
    const totalHeight = nums.length * digitsHeight

    const performNumAnim = ({
      digit,
      motionValue,
      animControlRef,
      round = 1,
      delay = 0,
      onComplete
    }: {
      digit: number
      motionValue: MotionValue<number>
      animControlRef: RefObject<AnimationPlaybackControls | null>
      round?: number
      delay?: number
      onComplete?: () => void
    }) => {
      const currentY = motionValue.get()
      const translateY = round === 0 ? digit * digitsHeight : totalHeight / 2

      if (currentY === -translateY) {
        motionValue.set(0)
      }

      const duration = durationPerRound * (Math.abs(translateY - currentY) / translateY)

      console.log({ duration })
      animControlRef.current = animate(motionValue, -translateY, {
        onComplete: () => {
          if (round > 0) {
            performNumAnim({
              digit,
              motionValue,
              animControlRef,
              round: round - 1,
              onComplete
            })
          } else {
            onComplete?.()
          }
        },
        duration: 0.2,
        delay,
        ease: 'linear'
      })
    }

    performNumAnim({
      digit: digit1,
      motionValue: num1YMotionValue,
      animControlRef: num1AnimControl,
      round: 5,
      delay: 1,
      onComplete: () => {
        setCompleteDigits((prev) => [true, prev[1], prev[2]])
      }
    })
    performNumAnim({
      digit: digit2,
      motionValue: num2YMotionValue,
      animControlRef: num2AnimControl,
      round: 7,
      delay: 1.3,
      onComplete: () => {
        setCompleteDigits((prev) => [prev[0], true, prev[2]])
      }
    })
    performNumAnim({
      digit: digit3,
      motionValue: num3YMotionValue,
      animControlRef: num3AnimControl,
      round: 9,
      delay: 1.5,
      onComplete: () => {
        setCompleteDigits((prev) => [prev[0], prev[1], true])
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, targetDigits])

  useEffect(() => {
    performAnimation()
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      num1AnimControl.current?.stop()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      num2AnimControl.current?.stop()
      // eslint-disable-next-line react-hooks/exhaustive-deps
      num3AnimControl.current?.stop()
    }
  }, [performAnimation])

  useEffect(() => {
    if (isAllComplete) {
      onComplete?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllComplete])

  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center">
      <div className="flex h-[90px] items-center gap-0.5 text-[56px] leading-none font-semibold">
        <span className="block h-full overflow-hidden">
          <motion.span
            className={cn(
              'flex flex-col text-[#4D4D4D] transition-colors duration-200',
              completeDigits[0] && 'text-white'
            )}
            style={{ y: num1YMotionValue }}
          >
            {nums.map((num, index) => {
              return (
                <span
                  key={index}
                  className="flex h-[90px] items-center justify-center tabular-nums"
                >
                  {num}
                </span>
              )
            })}
          </motion.span>
        </span>
        <span className="block h-full overflow-hidden">
          <motion.span
            className={cn(
              'flex flex-col text-[#4D4D4D] transition-colors duration-200',
              completeDigits[1] && 'text-white'
            )}
            style={{ y: num2YMotionValue }}
          >
            {nums.map((num, index) => {
              return (
                <span
                  key={index}
                  className="flex h-[90px] items-center justify-center tabular-nums"
                >
                  {num}
                </span>
              )
            })}
          </motion.span>
        </span>
        <span className="block h-full overflow-hidden">
          <motion.span
            className={cn(
              'flex flex-col text-[#4D4D4D] transition-colors duration-200',
              completeDigits[2] && 'text-white'
            )}
            style={{ y: num3YMotionValue }}
          >
            {nums.map((num, index) => {
              return (
                <span
                  key={index}
                  className="flex h-[90px] items-center justify-center tabular-nums"
                >
                  {num}
                </span>
              )
            })}
          </motion.span>
        </span>
      </div>

      <AnimatePresence>
        {isAllComplete && (
          <motion.div
            className="overflow-hidden"
            initial={{ width: 0 }}
            animate={{
              width: 'auto',
              transition: {
                when: 'beforeChildren',
                delay: 0.1
              }
            }}
            exit={{ width: 0 }}
          >
            <motion.div
              className="pl-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
              exit={{ opacity: 0 }}
            >
              <Token className="size-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Ticker
