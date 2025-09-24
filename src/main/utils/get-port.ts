export type Options = {
  readonly port?: number | Iterable<number>
}

const getPort = async (options?: Options) => {
  const { default: getPort, clearLockedPorts } = await import('get-port')
  clearLockedPorts()
  const port = await getPort(options)
  return port
}

export { getPort }
