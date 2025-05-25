import execa, { Options } from 'execa'

const runCommand = (command: string, args: string[], options?: Options) => {
  return execa(command, args, options)
}

const runCommandWithJsonStdout = async <T = any>(
  command: string,
  args: string[],
  options: Options = {}
): Promise<T> => {
  return execa(command, args, {
    ...options
  }).then((res) => {
    return JSON.parse(res.stdout)
  })
}

export { runCommand, runCommandWithJsonStdout }
