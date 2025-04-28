import { cn } from '@/utils/tw'

interface AvatarPlaceholderProps extends React.SVGProps<SVGSVGElement> {
  colorType?: 'green' | 'yellow'
}

const AvatarPlaceholder = ({
  className,
  colorType = 'green',
  ...props
}: AvatarPlaceholderProps) => {
  return (
    <svg
      className={cn(className)}
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="mask0_4826_14285"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="23"
        height="23"
      >
        <circle cx="11.5" cy="11.5" r="11.5" fill={colorType === 'green' ? '#5EED87' : '#F6F655'} />
      </mask>
      <g mask="url(#mask0_4826_14285)">
        <circle cx="11.5" cy="11.5" r="11.5" fill={colorType === 'green' ? '#5EED87' : '#F6F655'} />
        <circle
          cx="14.4919"
          cy="5.32951"
          r="3.08537"
          fill={colorType === 'green' ? '#57D27A' : '#D8D94F'}
        />
        <path
          opacity="0.5"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M25.7993 13.5972L25.8019 13.6001L25.8048 13.5972H25.7993ZM22.9367 10.4021L25.7993 13.5972H21.061L16.0962 25.9699C15.8438 26.5985 15.6089 26.9398 14.823 27.1071H11.0659L15.9129 15.0592C16.194 14.3614 15.6835 13.6001 14.9349 13.6001H13.2026L8.19996 26.0613C7.94758 26.687 7.74781 26.9391 6.96197 27.1092H3.20483L3.2077 27.1064L8.64238 13.6001H6.33938C5.55927 13.6001 4.81932 13.2685 4.29734 12.686L1.30884 9.34961H20.5878C21.4826 9.34961 22.3373 9.73313 22.9367 10.4021Z"
          fill="#313532"
          fillOpacity="0.3"
        />
      </g>
    </svg>
  )
}

export default AvatarPlaceholder
