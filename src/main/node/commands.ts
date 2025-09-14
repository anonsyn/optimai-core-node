import { runCommand } from '../utils/command'
import { nodeBinaryPath, nodeDataPath } from './paths'

// Import types separately since they can be imported statically
import type { Options } from 'execa'

// Helper function to run node CLI commands with data directory
const runNodeCommand = (args: string[], options?: Options) => {
  return runCommand(nodeBinaryPath, ['--data-dir', nodeDataPath, ...args], options)
}

// Start the API server
const startApiServer = (port: number, options?: Options) => {
  return runNodeCommand(['api-server', '--port', port.toString(), '--no-reload'], options)
}

export const nodeCommands = {
  startApiServer
}
