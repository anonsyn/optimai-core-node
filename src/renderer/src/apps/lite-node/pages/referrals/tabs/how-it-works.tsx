import IMAGES from '@/configs/images'

const HowItWorks = () => {
  return (
    <div className="h-full w-full pt-4 pb-4">
      <img
        src={IMAGES.SITES.HOW_IT_WORK}
        alt="how-it-works"
        className="mx-auto max-h-[min(100%,186px)] w-auto max-w-full"
      />
    </div>
  )
}

export default HowItWorks
