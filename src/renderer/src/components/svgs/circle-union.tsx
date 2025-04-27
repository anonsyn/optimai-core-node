interface CircleUnionProps extends React.SVGProps<SVGSVGElement> {}

const CircleUnion = (props: CircleUnionProps) => {
  return (
    <svg
      width="84"
      height="44"
      viewBox="0 0 84 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.3" filter="url(#filter0_i_3197_87860)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M48.7529 39.5661C45.3433 36.9908 38.6567 36.9908 35.2471 39.5661C31.5622 42.3494 26.9738 44 22 44C9.84974 44 0 34.1503 0 22C0 9.84974 9.84974 0 22 0C26.9738 0 31.5622 1.65058 35.2471 4.43386C38.6567 7.00916 45.3433 7.00916 48.7529 4.43387C52.4378 1.65058 57.0262 0 62 0C74.1503 0 84 9.84974 84 22C84 34.1503 74.1503 44 62 44C57.0262 44 52.4378 42.3494 48.7529 39.5661Z"
          fill="#121614"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_3197_87860"
          x="0"
          y="0"
          width="84"
          height="44"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3197_87860" />
        </filter>
      </defs>
    </svg>
  )
}

export default CircleUnion
