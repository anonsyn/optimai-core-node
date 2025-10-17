import crypto from 'crypto'
import { screen } from 'electron'
import { machineIdSync } from 'node-machine-id'
import os from 'os'
import * as si from 'systeminformation'

import { DeviceType, type DeviceInfo, type GPUInfo, type GPUType } from '../api/device/types'
import { getErrorMessage } from './get-error-message'

function getScreenInfo(): {
  screen_width_px: number
  screen_height_px: number
  color_depth: number
  scale_factor: number
} {
  try {
    const primaryDisplay = screen.getPrimaryDisplay()
    return {
      screen_width_px: primaryDisplay.size.width,
      screen_height_px: primaryDisplay.size.height,
      color_depth: primaryDisplay.colorDepth ?? 32,
      scale_factor: primaryDisplay.scaleFactor ?? 1
    }
  } catch (error) {
    console.error(
      'Failed to read screen info, using defaults:',
      getErrorMessage(error, 'Failed to read screen info')
    )
    return {
      screen_width_px: 1920,
      screen_height_px: 1080,
      color_depth: 32,
      scale_factor: 1
    }
  }
}

function getSystemInfo(): {
  cpu_cores: number
  memory_gb: number
} {
  const cpuCores = os.cpus()?.length ?? 0
  const memoryGB = Math.round(os.totalmem() / 1024 ** 3)

  return {
    cpu_cores: cpuCores,
    memory_gb: memoryGB
  }
}

function getMachineId(): string | undefined {
  try {
    return machineIdSync(true)
  } catch (error) {
    console.error('Failed to read machine id:', getErrorMessage(error, 'Failed to read machine id'))
    return undefined
  }
}

function getLanguage(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    if (locale) {
      return locale
    }
  } catch (error) {
    console.error('Failed to resolve locale:', getErrorMessage(error, 'Failed to resolve locale'))
  }

  return process.env.LANG?.split('.')[0] || 'en-US'
}

function getTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone) {
      return timezone
    }
  } catch (error) {
    console.error(
      'Failed to resolve timezone:',
      getErrorMessage(error, 'Failed to resolve timezone')
    )
  }

  return 'UTC'
}

function normalizeOsName(osType: string): string {
  const normalized = osType.toLowerCase()

  // Map Node.js os.type() values to server-expected values
  switch (normalized) {
    case 'darwin':
      return 'mac'
    case 'win32':
    case 'windows_nt':
      return 'win'
    case 'linux':
      return 'linux'
    default:
      return normalized
  }
}

function hashMachineId(machineId: string): string {
  return crypto.createHash('sha256').update(machineId).digest('hex')
}

async function getGPUInfo(): Promise<GPUInfo | undefined> {
  try {
    const graphics = await si.graphics()

    if (!graphics.controllers || graphics.controllers.length === 0) {
      return undefined
    }

    // Get the primary GPU (usually the first one)
    const primaryGPU = graphics.controllers[0]

    // Determine GPU type based on vendor and model
    let gpuType: GPUType | undefined
    const vendor = primaryGPU.vendor?.toLowerCase() || ''
    const model = primaryGPU.model?.toLowerCase() || ''

    if (
      vendor.includes('nvidia') ||
      vendor.includes('amd') ||
      model.includes('radeon') ||
      model.includes('geforce')
    ) {
      gpuType = 'discrete'
    } else if (vendor.includes('intel') && (model.includes('uhd') || model.includes('iris'))) {
      gpuType = 'integrated'
    } else if (vendor.includes('apple') || model.includes('apple')) {
      gpuType = 'integrated' // Apple Silicon GPUs are integrated
    }

    // Convert VRAM from MB to GB
    const vramGB = primaryGPU.vram ? Math.round((primaryGPU.vram / 1024) * 10) / 10 : undefined

    return {
      vendor: primaryGPU.vendor || undefined,
      model: primaryGPU.model || undefined,
      vram_gb: vramGB,
      type: gpuType
    }
  } catch (error) {
    console.error('Failed to read GPU info:', getErrorMessage(error, 'Failed to read GPU info'))
    return undefined
  }
}

export async function getFullDeviceInfo(): Promise<{
  deviceInfo: DeviceInfo
}> {
  const { cpu_cores, memory_gb } = getSystemInfo()
  const screenInfo = getScreenInfo()
  const machineId = getMachineId()
  const gpuInfo = await getGPUInfo()

  const deviceInfo: DeviceInfo = {
    cpu_cores,
    memory_gb,
    ...screenInfo,
    device_type: DeviceType.PC,
    language: getLanguage(),
    timezone: getTimezone(),
    os_name: normalizeOsName(os.type()),
    os_version: os.release()
  }

  if (machineId) {
    deviceInfo.machine_id = hashMachineId(machineId)
  }

  if (gpuInfo) {
    deviceInfo.gpu = gpuInfo
  }

  return {
    deviceInfo
  }
}
