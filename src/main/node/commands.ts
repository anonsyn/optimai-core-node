import { runCommand, runCommandWithJsonStdout } from '../utils/command'
import { nodeBinaryPath, nodeDataPath } from './paths'

// Import types separately since they can be imported statically
import type { Options } from 'execa'

// Helper function to dynamically import execa

const executeNodeCommand = async (args: string[], options?: Options) => {
  return runCommand(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

const executeNodeCommandWithJsonStdout = async (args: string[], options?: Options) => {
  return runCommandWithJsonStdout(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

// AUTH COMMANDS
const me = async (options?: Options) => {
  return executeNodeCommand(['auth', 'me'], options)
}

const logout = async (options?: Options) => {
  return executeNodeCommand(['auth', 'logout'], options)
}

const getAccessToken = async (options?: Options) => {
  return executeNodeCommandWithJsonStdout(['auth', 'get-access-token'], options)
}

const getRefreshToken = async (options?: Options) => {
  return executeNodeCommand(['auth', 'get-refresh-token'], options)
}

const saveAccessToken = async (accessToken: string, options?: Options) => {
  return executeNodeCommand(['auth', 'save-access-token', '--access_token', accessToken], options)
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
  getAccessToken,
  getRefreshToken,
  getTokens,
  saveAccessToken,
  saveTokens,
  refreshToken,
  logout
}
