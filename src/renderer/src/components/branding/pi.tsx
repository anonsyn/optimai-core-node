import IMAGES from '@/configs/images'
import { cn } from '@/utils/tw'

interface PiProps extends React.HTMLAttributes<HTMLImageElement> {}

const Pi = ({ className, ...props }: PiProps) => {
  return (
    <img
      className={cn('max-h-none w-auto max-w-none', className)}
      src={IMAGES.BRANDING.PI}
      alt="Pi"
      {...props}
    />
  )
}

interface PiSvgProps extends React.SVGProps<SVGSVGElement> {}

const PiSvg = ({ className, ...props }: PiSvgProps) => {
  return (
    <svg
      className={cn('pointer-events-none h-auto w-5', className)}
      width="208"
      height="161"
      viewBox="0 0 208 161"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0.583058L24.3855 29.4228C29.4919 35.4619 36.999 38.9452 44.9076 38.9452H62.1898L16.0992 160.471L16.0748 160.497H47.9683C54.6391 158.965 56.3349 156.695 58.4774 151.059L100.9 38.9452H128.976L82.8845 160.474L82.8601 160.5H114.754C121.424 158.968 123.12 156.698 125.263 151.062L167.687 38.9452H208L183.536 10.0201C178.427 3.97891 170.915 0.496164 163.003 0.500187L0 0.583058Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { Pi, PiSvg }
