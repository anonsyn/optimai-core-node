export type Options = {
  readonly port?: number | Iterable<number>
}

const getPort = async (options?: Options) => {
  const { default: getPort } = await import('get-port')
  return getPort(options)
}

export { getPort }
