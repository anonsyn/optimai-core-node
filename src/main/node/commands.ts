import { runCommand, runCommandWithJsonStdout } from '../utils/command'
import { nodeBinaryPath, nodeDataPath } from './paths'

// Import types separately since they can be imported statically
import type { Options } from 'execa'

// Helper function to dynamically import execa

const runNodeCommand = (args: string[], options?: Options) => {
  return runCommand(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

const runNodeCommandWithJsonStdout = (args: string[], options?: Options) => {
  return runCommandWithJsonStdout(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

// AUTH COMMANDS
const me = (options?: Options) => {
  return runNodeCommand(['auth', 'me'], options)
}

const logout = (options?: Options) => {
  return runNodeCommand(['auth', 'logout'], options)
}

const getAccessToken = (options?: Options) => {
  return runNodeCommandWithJsonStdout(['auth', 'get-access-token'], options)
}

const getRefreshToken = (options?: Options) => {
  return runNodeCommand(['auth', 'get-refresh-token'], options)
}

const saveAccessToken = (accessToken: string, options?: Options) => {
  return runNodeCommand(['auth', 'save-access-token', '--access_token', accessToken], options)
}

const getTokens = (options?: Options) => {
  return runNodeCommand(['auth', 'get-tokens'], options)
}

const saveTokens = (accessToken: string, refreshToken: string, options?: Options) => {
  return runNodeCommand(
    ['auth', 'save-tokens', '--access_token', accessToken, '--refresh_token', refreshToken],
    options
  )
}

const refreshToken = (options?: Options) => {
  return runNodeCommandWithJsonStdout(['auth', 'refresh-token'], options)
}

const startNode = (port: number, options?: Options) => {
  return runNodeCommand(['node', 'start', '--port', port.toString()], options)
}

export const nodeCommands = {
  me,
  getAccessToken,
  getRefreshToken,
  getTokens,
  saveAccessToken,
  saveTokens,
  refreshToken,
  logout,
  startNode
}
