import { PropsWithChildren, useEffect } from 'react'

const NodeProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    window.nodeIPC.startNode().catch(console.error)
  }, [])

  return <>{children}</>
}

export default NodeProvider
