import { Options } from 'electron'

const getExeca = async () => {
  const { execa } = await import('execa')
  return execa
}

const runCommand = async (command: string, args: string[], options?: Options) => {
  const execa = await getExeca()
  return execa(command, args, options)
}

const runCommandWithJsonStdout = async (command: string, args: string[], options: Options = {}) => {
  const execa = await getExeca()

  return execa(command, args, {
    ...options
  }).then((res) => {
    console.log(res)
    console.log('COMPLETED COMMAND')
    return JSON.parse(res.stdout)
  })
}

export { getExeca, runCommand, runCommandWithJsonStdout }
