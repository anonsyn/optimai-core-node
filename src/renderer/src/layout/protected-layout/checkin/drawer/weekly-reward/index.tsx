import Token from '@/components/branding/token'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

import { Icon } from '@/components/ui/icon'
import {
  useGetCheckInHistoryQuery,
  useGetDailyTasksQuery,
  useHasClaimedWeeklyRewardQuery
} from '@/queries/daily-tasks'
import { ClaimCheckInWeeklyRewardResponse, dailyTaskService } from '@/services/daily-tasks'
import { checkInActions, checkInSelectors } from '@/store/slices/checkin'
import { compactNumber } from '@/utils/compact-number'
import { getDayOfWeek } from '@/utils/get-day-of-week'
import { useMutation } from '@tanstack/react-query'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { HTMLAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import RewardLock from './reward-lock'
import RewardLockBackground from './reward-lock-background'
import Ticker from './ticker'
import { Status } from './types'

const claimReward = async (): Promise<ClaimCheckInWeeklyRewardResponse> => {
  return dailyTaskService.claimCheckInWeeklyReward().then((res) => res.data)
}

const defaultHistory = []

const WeeklyReward = () => {
  const currentDayIndex = getDayOfWeek()
  const { data } = useGetCheckInHistoryQuery()
  const history = data?.check_in_history || defaultHistory

  const dailyCheckinCanvasRef = useRef<HTMLCanvasElement>(null)
  const weeklyCheckinCanvasRef = useRef<HTMLCanvasElement>(null)

  const shouldRunAnimation = useAppSelector(checkInSelectors.shouldRunAnimation)

  const { data: hasClaimedData, refetch: refetchHasClaimedWeeklyReward } =
    useHasClaimedWeeklyRewardQuery()

  const [hasClaimedWeeklyReward, setHasClaimedWeeklyReward] = useState(false)
  const [claimingWeeklyReward, setClaimingWeeklyReward] = useState(false)
  const [claimedWeeklyReward, setClaimedWeeklyReward] = useState(0)
  const [isTickerCompleted, setIsTickerCompleted] = useState(false)

  const { data: task } = useGetDailyTasksQuery()
  const dailyCheckInReward = task?.reward || 5

  const { status, count } = useMemo((): { status: Status; count: number } => {
    const passedDays = history.slice(0, currentDayIndex + 1)
    const checkedDays = passedDays.filter(Boolean)
    const isFailed = currentDayIndex === 6 && passedDays.some((day) => !day)

    const count = checkedDays.length
    if (isFailed) {
      return {
        status: 'failed',
        count
      }
    }

    if (checkedDays.length === 7) {
      return {
        status: 'completed',
        count
      }
    }

    return {
      status: 'inProgress',
      count
    }
  }, [currentDayIndex, history])

  const { mutateAsync } = useMutation({
    mutationFn: claimReward
  })

  const handleClaimWeeklyReward = async () => {
    setClaimingWeeklyReward(true)
    await mutateAsync().then(({ reward }) => {
      setClaimedWeeklyReward(Number(reward))
      setHasClaimedWeeklyReward(true)
      refetchHasClaimedWeeklyReward()
    })
  }

  const dispatch = useAppDispatch()

  const handleTickerCompleted = useCallback(() => {
    console.log('ticker completed')
    setIsTickerCompleted(true)
  }, [])

  useEffect(() => {
    if (hasClaimedData && hasClaimedData.has_claimed) {
      setHasClaimedWeeklyReward(hasClaimedData.has_claimed)
      setClaimedWeeklyReward(hasClaimedData.claimed_reward)
    }
  }, [hasClaimedData])

  useEffect(() => {
    if (dailyCheckinCanvasRef.current && shouldRunAnimation) {
      const canvas = dailyCheckinCanvasRef.current
      const canvasAny = canvas as any
      if (canvasAny.confetti) {
        return
      }

      // Set canvas size to match parent
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }

      const confettiInstance = confetti.create(canvas, {
        resize: true
      })
      canvasAny.confetti = confettiInstance

      const count = 400
      const defaults = {
        origin: { y: 0.7 }
      }

      const fire = (
        particleRatio: number,
        opts: {
          spread?: number
          startVelocity?: number
          decay?: number
          scalar?: number
        }
      ): void => {
        confettiInstance({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        })
      }

      let timeout = window.setTimeout(() => {
        Promise.all([
          fire(0.25, {
            spread: 26,
            startVelocity: 50
          }),
          fire(0.2, {
            spread: 60
          }),
          fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
          }),
          fire(0.1, {
            spread: 120,
            startVelocity: 20,
            decay: 0.92,
            scalar: 1.2
          }),
          fire(0.1, {
            spread: 120,
            startVelocity: 40
          })
        ]).then(() => {
          timeout = window.setTimeout(() => {
            dispatch(checkInActions.setShouldRunAnimation(false))
            dispatch(checkInActions.setAlreadyCheckIn(true))
          }, 6000)
        })
      }, 450)

      return () => {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRunAnimation])

  useEffect(() => {
    if (weeklyCheckinCanvasRef.current && isTickerCompleted) {
      const canvas = weeklyCheckinCanvasRef.current
      const canvasAny = canvas as any

      // Set canvas size to match parent
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }

      const confettiInstance: confetti.CreateTypes =
        canvasAny.confetti ||
        confetti.create(canvas, {
          resize: true
        })
      canvasAny.confetti = confettiInstance

      const duration: number = 12 * 1000
      const animationEnd: number = Date.now() + duration
      const defaults: confetti.Options = {
        startVelocity: 30,
        spread: 200,
        ticks: 60,
        zIndex: 0
      }

      const randomInRange = (min: number, max: number): number => {
        return Math.random() * (max - min) + min
      }

      let interval: NodeJS.Timeout
      const timeout = setTimeout(() => {
        interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            return clearInterval(interval)
          }

          const particleCount = 50 * (timeLeft / duration)
          // since particles fall down, start a bit higher than random
          confettiInstance({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          })
          confettiInstance({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          })
        }, 250)
      }, 450)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [isTickerCompleted])

  return (
    <div id="weekly-reward" className="flex flex-col overflow-hidden px-4">
      <div className="bg-background/30 relative overflow-hidden rounded-t-lg border border-white/4">
        <div className="relative flex min-h-75 w-full flex-col items-center pt-5">
          <canvas
            ref={weeklyCheckinCanvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
          {shouldRunAnimation ? (
            <>
              <Header>
                <Title>Welcome Back!</Title>
                <Description>
                  You&apos;ve earned your daily reward—come <br /> back tomorrow for more bonuses!
                </Description>
              </Header>

              <div className="relative w-full flex-1">
                <motion.div
                  className="absolute top-1/2 left-1/2 flex origin-center -translate-x-1/2 -translate-y-1/2 items-center gap-3"
                  initial={{
                    opacity: 0,
                    top: '100%',
                    x: '-50%',
                    y: '-50%',
                    scale: 0
                  }}
                  animate={{
                    opacity: 1,
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                    scale: 1
                  }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <p className="text-56 leading-normal font-semibold tracking-wide text-white">
                    +
                    {compactNumber(dailyCheckInReward, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <Token className="size-10" />
                </motion.div>
              </div>
              <canvas
                className="pointer-events-none absolute inset-0 h-full w-full"
                ref={dailyCheckinCanvasRef}
              />
            </>
          ) : (
            <>
              {status === 'failed' ? (
                <>
                  <Header>
                    <Title>
                      <Icon className="size-4.5" icon="Sad" />
                      <span>Incomplete Week</span>
                    </Title>
                    <Description>
                      Oops! You missed a check-in. <br />
                      Try again next week with daily check-ins!
                    </Description>
                  </Header>
                  <Content>
                    <RewardLock status={status} />
                  </Content>
                </>
              ) : (
                <>
                  {status === 'inProgress' ? (
                    <>
                      <Header>
                        <Title>
                          <Icon className="size-4.5" icon="Fire" />
                          <span>Unlock Your Mystery Prize</span>
                        </Title>
                        <Description>
                          Come back tomorrow to check in! <br /> Tip: Complete a full week for a
                          surprise!
                        </Description>
                      </Header>
                      <Content>
                        <RewardLock status={status} progress={count / 7} />
                      </Content>
                    </>
                  ) : (
                    <>
                      {!hasClaimedWeeklyReward && !claimingWeeklyReward ? (
                        <Header>
                          <Title>
                            <Icon className="size-4.5" icon="Fire" />
                            <span>Triumph Week</span>
                          </Title>
                          <Description>
                            Congratulations! You&apos;re now eligible to <br /> claim your Mystery
                            Weekly Gift!
                          </Description>
                        </Header>
                      ) : (
                        <Header>
                          <Title>
                            <Icon className="size-4.5" icon="Fire" />
                            <span>Week of Win</span>
                          </Title>
                          <Description>
                            Fantastic! Keep up the great work, and <br /> more exciting prizes could
                            be yours!
                          </Description>
                        </Header>
                      )}

                      {!hasClaimedWeeklyReward && !claimingWeeklyReward ? (
                        <Content>
                          <Button
                            className="absolute top-1/2 left-1/2 h-10 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full"
                            size="sm"
                            onClick={handleClaimWeeklyReward}
                          >
                            <svg
                              className="size-4.5"
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="20"
                              viewBox="0 0 18 20"
                              fill="none"
                            >
                              <path
                                d="M7.60589 15.2381C8.1288 15.2381 8.57659 15.0517 8.94928 14.679C9.32197 14.3063 9.508 13.8578 9.50736 13.3333C9.50673 12.8089 9.3207 12.3606 8.94928 11.9886C8.57786 11.6165 8.13006 11.4298 7.60589 11.4286C7.08172 11.4273 6.63424 11.614 6.26345 11.9886C5.89266 12.3632 5.70632 12.8114 5.70442 13.3333C5.70252 13.8552 5.88886 14.3038 6.26345 14.679C6.63804 15.0543 7.08552 15.2406 7.60589 15.2381ZM1.90147 20C1.37857 20 0.931088 19.8136 0.559033 19.441C0.186978 19.0683 0.000633824 18.6197 0 18.0952V8.57143C0 8.04762 0.186344 7.59936 0.559033 7.22667C0.931722 6.85397 1.3792 6.6673 1.90147 6.66667H8.55663V4.7619C8.55663 3.44444 9.02027 2.32159 9.94756 1.39333C10.8748 0.465079 11.9958 0.000634921 13.3103 0C14.4987 0 15.5328 0.385079 16.4126 1.15524C17.2923 1.9254 17.819 2.87365 17.9927 4C18.0244 4.20635 17.9531 4.38508 17.7788 4.53619C17.6045 4.6873 17.3826 4.76254 17.1133 4.7619C16.8439 4.76127 16.622 4.70571 16.4477 4.59524C16.2734 4.48476 16.1467 4.30222 16.0674 4.04762C15.8931 3.44444 15.5566 2.93651 15.0578 2.52381C14.5589 2.11111 13.9765 1.90476 13.3103 1.90476C12.518 1.90476 11.8446 2.18254 11.29 2.7381C10.7354 3.29365 10.4581 3.96825 10.4581 4.7619V6.66667H13.3103C13.8332 6.66667 14.281 6.85333 14.6537 7.22667C15.0264 7.6 15.2124 8.04825 15.2118 8.57143V18.0952C15.2118 18.619 15.0258 19.0676 14.6537 19.441C14.2816 19.8143 13.8338 20.0006 13.3103 20H1.90147Z"
                                fill="black"
                              />
                            </svg>
                            <span className="text-14">Claim Prize</span>
                          </Button>
                        </Content>
                      ) : (
                        <div className="relative w-full flex-1">
                          {claimingWeeklyReward ? (
                            <Ticker
                              reward={claimedWeeklyReward}
                              onComplete={handleTickerCompleted}
                            />
                          ) : (
                            <div className="absolute flex size-full items-center justify-center gap-4">
                              <p className="text-56 leading-relaxed font-semibold tracking-wide text-white">
                                {claimedWeeklyReward}
                              </p>
                              <Token className="size-10" />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const Header = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="flex w-full flex-col items-center gap-1" {...props}>
      {children}
    </div>
  )
}

const Title = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className="text-16 inline-flex items-center justify-center gap-2 leading-normal font-medium text-white"
      {...props}
    >
      {children}
    </h3>
  )
}

const Description = ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className="text-14 text-center leading-normal text-white/50" {...props}>
      {children}
    </p>
  )
}

const Content = ({
  background = true,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { background?: boolean }) => {
  return (
    <div className="mt-7 flex-1" {...props}>
      <div className="relative mt-auto h-45 w-70">
        {background && <RewardLockBackground className="pointer-events-none absolute inset-0" />}
        <div className="size-full">{children}</div>
      </div>
    </div>
  )
}

export default WeeklyReward
