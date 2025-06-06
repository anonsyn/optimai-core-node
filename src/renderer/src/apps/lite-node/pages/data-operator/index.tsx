import { useHeader } from '@/hooks/use-header'
import Features from './features'

const DataOperatorPage = () => {
  useHeader({ title: 'Data Operator' })

  return (
    <div className="h-full overflow-y-auto" data-global-glow="true">
      <Features />
    </div>
  )
}

export default DataOperatorPage
