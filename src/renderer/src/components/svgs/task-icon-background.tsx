import { SVGProps } from 'react'

const TaskIconBackground = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="48" height="48" rx="8" fill="url(#paint0_radial_9400_87991)" fillOpacity="0.1" />
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx="7.5"
        stroke="url(#paint1_linear_9400_87991)"
        strokeOpacity="0.2"
      />
      <defs>
        <radialGradient
          id="paint0_radial_9400_87991"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1.35 1.33993e-06) rotate(47.0388) scale(65.5903 56.2821)"
        >
          <stop stopColor="#E4E4E7" />
          <stop offset="1" stopColor="#737373" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_9400_87991"
          x1="24"
          y1="0"
          x2="24"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" stopColor="#666666" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default TaskIconBackground
