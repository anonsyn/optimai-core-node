import { nodeBinaryPath, nodeDataPath } from './paths'

// Import types separately since they can be imported statically
import type { Options } from 'execa'

// Helper function to dynamically import execa
const getExeca = async () => {
  const { execa } = await import('execa')
  return execa
}

const executeNodeCommand = async (args: string[], options?: Options) => {
  const execa = await getExeca()
  return execa(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

const me = async (options?: Options) => {
  return executeNodeCommand(['auth', 'me'], options)
}

const getTokens = async (options?: Options) => {
  return executeNodeCommand(['auth', 'get-tokens'], options)
}

const saveTokens = async (accessToken: string, refreshToken: string, options?: Options) => {
  return executeNodeCommand(
    ['auth', 'save-tokens', '--access_token', accessToken, '--refresh_token', refreshToken],
    options
  )
}

const refreshToken = async (options?: Options) => {
  return executeNodeCommand(['auth', 'refresh-token'], options)
}

export const nodeCommands = {
  me,
  getTokens,
  saveTokens,
  refreshToken
}
