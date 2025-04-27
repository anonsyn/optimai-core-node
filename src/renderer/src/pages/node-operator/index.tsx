import { useHeader } from '@/hooks/use-header'
import Features from './features'

const NodeOperatorPage = () => {
  useHeader({ title: 'Node Operator' })

  return (
    <div data-global-glow="true" className="h-full overflow-y-auto">
      <Features />
    </div>
  )
}

export default NodeOperatorPage
