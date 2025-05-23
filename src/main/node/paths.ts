import { app } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import { IS_DEV } from '../configs/constants'
import { getOS, OS } from '../utils/os'

const BinExtMap = {
  [OS.WIN]: '.exe',
  [OS.MAC]: '',
  [OS.LINUX]: ''
}

const os = getOS()

if (IS_DEV) {
  const BinFolderMap = {
    [OS.WIN]: 'windows',
    [OS.MAC]: 'darwin',
    [OS.LINUX]: 'linux'
  }

  const nodeTmpPath = path.resolve(app.getAppPath(), 'tmp', 'applications', 'node')
  const nodeAppBin = path.resolve(app.getAppPath(), 'applications', 'node')

  fs.ensureDirSync(nodeTmpPath)

  fs.copySync(path.resolve(nodeAppBin, BinFolderMap[os]), path.resolve(nodeTmpPath, 'bin'))
}

const applicationsPath = IS_DEV
  ? path.resolve(app.getAppPath(), 'tmp', 'applications')
  : path.resolve(process.resourcesPath, 'applications')

const NODE_FILE_NAME = 'node_cli'

const nodeBinaryPath = path.resolve(
  applicationsPath,
  'node',
  'bin',
  `${NODE_FILE_NAME}${BinExtMap[os]}`
)

const nodeDataPath = path.resolve(app.getPath('userData'), 'node')

export { nodeBinaryPath, nodeDataPath }
