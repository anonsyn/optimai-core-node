#!/usr/bin/env node

import * as fs from 'fs-extra'
import * as https from 'https'
import * as os from 'os'
import * as path from 'path'

// Use the same base URL as in wrapper.py
const UPDATE_BASE_URL = process.env.UPDATE_BASE_URL || 'https://cli-node.optimai.network'

interface VersionInfo {
  version: string
  path: string
}

/**
 * Get the OS type
 */
function getOSType(): 'windows' | 'darwin' | 'linux' {
  const platform = os.platform()
  switch (platform) {
    case 'win32':
      return 'windows'
    case 'darwin':
      return 'darwin'
    case 'linux':
      return 'linux'
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * Get the version filename pattern for the current platform
 */
function getVersionFilename(): string {
  const osType = getOSType()
  const arch = os.arch()

  switch (osType) {
    case 'windows':
      return 'windows-latest.json'
    case 'darwin':
      return arch === 'arm64' ? 'darwin-arm64-latest.json' : 'darwin-x86_64-latest.json'
    case 'linux':
      return 'ubuntu-latest.json'
    default:
      throw new Error(`Unsupported OS: ${osType}`)
  }
}

/**
 * Get the applications directory path
 */
function getApplicationsPath(): string {
  // Get the project root directory (one level up from scripts)
  const projectRoot = path.resolve(__dirname, '..')
  return path.resolve(projectRoot, 'applications')
}

/**
 * Get the target binary directory and filename
 */
function getTargetBinaryInfo(): { binDir: string; fileName: string } {
  const applicationsPath = getApplicationsPath()
  const osType = getOSType()

  const binDir = path.resolve(applicationsPath, 'node', osType)

  let fileName: string
  switch (osType) {
    case 'windows':
      fileName = 'node_cli.exe'
      break
    case 'darwin':
      fileName = 'node_cli'
      break
    case 'linux':
      fileName = 'node_cli'
      break
    default:
      throw new Error(`Unsupported OS: ${osType}`)
  }

  return { binDir, fileName }
}

/**
 * Download a file from URL to local path
 */
function downloadFile(url: string, destinationPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`)
    console.log(`To: ${destinationPath}`)

    // Ensure the destination directory exists
    fs.ensureDirSync(path.dirname(destinationPath))

    const file = fs.createWriteStream(destinationPath)

    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          const location = response.headers.location
          if (location) {
            console.log(`Redirecting to: ${location}`)
            file.close()
            fs.unlinkSync(destinationPath)
            downloadFile(location, destinationPath).then(resolve).catch(reject)
            return
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`))
          return
        }

        const totalSize = parseInt(response.headers['content-length'] || '0', 10)
        let downloadedSize = 0

        response.on('data', (chunk) => {
          downloadedSize += chunk.length
          if (totalSize > 0) {
            const progress = ((downloadedSize / totalSize) * 100).toFixed(1)
            process.stdout.write(`\rProgress: ${progress}%`)
          }
        })

        response.pipe(file)

        file.on('finish', () => {
          file.close()
          console.log('\nDownload completed!')
          resolve()
        })

        file.on('error', (err) => {
          fs.unlink(destinationPath, () => {}) // Delete partial file
          reject(err)
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

/**
 * Fetch version information from the remote server
 */
async function fetchVersionInfo(endpoint: string = UPDATE_BASE_URL): Promise<VersionInfo> {
  const versionFilename = getVersionFilename()
  const versionUrl = `${endpoint}/${versionFilename}`

  console.log(`Fetching version info from: ${versionUrl}`)

  return new Promise((resolve, reject) => {
    https
      .get(versionUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch version info: HTTP ${response.statusCode}`))
          return
        }

        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })

        response.on('end', () => {
          try {
            const versionInfo: VersionInfo = JSON.parse(data)
            console.log(`Latest version: ${versionInfo.version}`)
            console.log(`Binary path: ${versionInfo.path}`)
            resolve(versionInfo)
          } catch (error) {
            reject(new Error(`Failed to parse version info: ${error}`))
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

/**
 * Main download function
 */
async function downloadNodeCLIBinary(): Promise<void> {
  try {
    console.log('Starting node CLI binary download...')
    console.log(`OS: ${getOSType()}`)
    console.log(`Architecture: ${os.arch()}`)

    // Get version information
    const versionInfo = await fetchVersionInfo()

    // Get target binary info
    const { binDir, fileName } = getTargetBinaryInfo()
    const targetBinaryPath = path.resolve(binDir, fileName)

    console.log(`Target binary path: ${targetBinaryPath}`)

    // Check if binary already exists
    if (fs.existsSync(targetBinaryPath)) {
      console.log('Binary already exists. Overwriting...')
    }

    // Download the binary
    const binaryUrl = `${UPDATE_BASE_URL}/${versionInfo.path}`
    await downloadFile(binaryUrl, targetBinaryPath)

    // Make the binary executable on Unix systems
    const osType = getOSType()
    if (osType === 'darwin' || osType === 'linux') {
      fs.chmodSync(targetBinaryPath, 0o755)
      console.log('Made binary executable')
    }

    console.log(`Successfully downloaded and installed node CLI binary v${versionInfo.version}`)
    console.log(`Binary location: ${targetBinaryPath}`)
  } catch (error) {
    console.error('Failed to download node CLI binary:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  downloadNodeCLIBinary()
}
