import { cn } from '@/utils/tw'
import { HTMLAttributes } from 'react'

interface RewardLockBackgroundProps extends HTMLAttributes<HTMLDivElement> {}

const RewardLockBackground = ({ className, ...props }: RewardLockBackgroundProps) => {
  return (
    <div
      className={cn(
        'rounded-t-16 bg-background/50 pointer-events-none absolute inset-0 overflow-hidden border border-b-0 border-white/5',
        className
      )}
      style={{
        boxShadow: '0px 0px 10px 0px rgba(255, 255, 255, 0.12) inset'
      }}
      {...props}
    >
      <svg
        className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
        xmlns="http://www.w3.org/2000/svg"
        width="280"
        height="178"
        viewBox="0 0 280 178"
        fill="none"
      >
        <mask id="path-1-inside-1_3917_1710" fill="white">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M146 84V0H134V84H0V96H134V178H146V96H280V84H146Z"
          />
        </mask>
        <path
          d="M146 0H147V-1H146V0ZM146 84H145V85H146V84ZM134 0V-1H133V0H134ZM134 84V85H135V84H134ZM0 84V83H-1V84H0ZM0 96H-1V97H0V96ZM134 96H135V95H134V96ZM134 178H133V179H134V178ZM146 178V179H147V178H146ZM146 96V95H145V96H146ZM280 96V97H281V96H280ZM280 84H281V83H280V84ZM145 0V84H147V0H145ZM134 1H146V-1H134V1ZM135 84V0H133V84H135ZM0 85H134V83H0V85ZM1 96V84H-1V96H1ZM134 95H0V97H134V95ZM135 178V96H133V178H135ZM146 177H134V179H146V177ZM145 96V178H147V96H145ZM280 95H146V97H280V95ZM279 84V96H281V84H279ZM146 85H280V83H146V85Z"
          fill="url(#paint0_radial_3917_1710)"
          fillOpacity="0.2"
          mask="url(#path-1-inside-1_3917_1710)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_3917_1710"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(140 89) rotate(90) scale(89 140)"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

export default RewardLockBackground
