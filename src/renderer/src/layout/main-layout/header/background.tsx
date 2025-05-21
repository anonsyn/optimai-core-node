import { useAnimate, useIsomorphicLayoutEffect } from 'framer-motion'

const Background = () => {
  const [scope, animate] = useAnimate()

  useIsomorphicLayoutEffect(() => {
    let control: ReturnType<typeof animate>
    // let mounted = true
    const startAnimate = async () => {
      const duration = 1.2
      control = animate([
        ['#dot-2', { opacity: [0.3, 1] }],
        ['#dot-3', { opacity: [0.3, 1] }, { at: 0 }],
        ['#dot-1', { opacity: [0.3, 1] }, { at: duration }],
        ['#dot-4', { opacity: [0.3, 1] }, { at: duration }],
        ['#dot-0', { opacity: [0.3, 1] }, { at: duration * 2 }],
        ['#dot-5', { opacity: [0.3, 1] }, { at: duration * 2 }]
      ])
    }
    startAnimate()

    return () => {
      control?.stop()
      // mounted = false
    }
  }, [])

  return (
    <div className="absolute inset-x-0 -top-16 bottom-0">
      <div
        className="backdrop-blur-50 absolute inset-0 border-b border-b-[#2D2D2D]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(23, 28, 23, 0.00) -3.67%, rgba(46, 56, 46, 0.02) 38.72%, rgba(199, 209, 199, 0.04) 58.72%)',
          maskRepeat: 'no-repeat',
          maskImage: 'var(--header-notch), linear-gradient(black, black)',
          maskComposite: 'exclude',
          maskPosition: '50% calc(100% + 1px), 0 0'
        }}
      />
      <svg
        className="absolute -bottom-px left-1/2 -translate-x-1/2"
        xmlns="http://www.w3.org/2000/svg"
        width="140"
        height="18"
        viewBox="0 0 140 18"
        fill="none"
      >
        <path
          d="M140 17H121C116.582 17 113.166 13.2038 111.044 9.32823C108.327 4.36539 103.057 1 96.9999 1H42.9999C36.9432 1 31.6724 4.36539 28.9557 9.32823C26.8341 13.2038 23.4182 17 18.9999 17H0"
          stroke="#2D2D2D"
        />
      </svg>
      <div
        ref={scope}
        className="absolute bottom-0 left-1/2 flex h-4 -translate-x-1/2 items-center gap-1.5 pt-px"
      >
        {Array.from({ length: 6 }).map((_, index) => {
          return (
            <div
              key={index}
              id={`dot-${index}`}
              className="dot bg-positive size-1 rounded-full opacity-30"
            />
          )
        })}
      </div>
    </div>
  )
}

export default Background
