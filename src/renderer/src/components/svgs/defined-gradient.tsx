const definedGradient = {
  mainLinearGradient: 'svg-main-gradient'
}

const getSvgDefs = (id: string) => {
  return `url(#${id})`
}

const DefinedGradient = () => {
  return (
    <svg
      className="absolute opacity-0"
      xmlns="http://www.w3.org/2000/svg"
      width="0"
      height="0"
      fill="none"
    >
      <defs>
        <linearGradient
          id={definedGradient.mainLinearGradient}
          x1="0%"
          y1="100%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F6F655" />
          <stop offset="1" stopColor="#5EED87" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export { DefinedGradient, definedGradient, getSvgDefs }
