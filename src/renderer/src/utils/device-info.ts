import { ClientToken, DeviceInfo, DeviceType } from '@/api/device/type'
import FingerprintJS, { GetResult } from '@fingerprintjs/fingerprintjs'
import CryptoJS from 'crypto-js'
import stringify from 'json-stable-stringify-without-jsonify'

const TELEGRAM_CLIENT_SECRET = import.meta.env.VITE_TELEGRAM_CLIENT_SECRET
const CLIENT_APP_ID = import.meta.env.VITE_CLIENT_APP_ID

async function getBrowserFingerprint(): Promise<{
  browserId: string
  components: GetResult['components']
}> {
  // Load FingerprintJS
  const fp = await FingerprintJS.load()

  // Get the full result with components
  const result = await fp.get()

  // Create a filtered version of the components object
  const filteredComponents = { ...result.components }

  // Define unstable sources that we want to remove
  const unstableSources = [
    'audio', // Audio fingerprint can be unstable
    'canvas', // Canvas rendering may vary
    'screenFrame', // Screen frame can affect fingerprint stability
    'webGlBasics', // GPU context-based info can be volatile
    'webGlExtensions', // Advanced WebGL parameters may fluctuate
    'privateClickMeasurement', // Privacy preserving ad measurement is inconsistent
    'plugins', // Installed plugins can vary due to privacy settings
    'fonts', // Font enumeration may change
    'domBlockers', // DOM blocker detection may vary
    'vendorFlavors' // Variations in browser vendor flavors
  ]

  // Define network-related sources that we want to remove, based strictly on the sources object defined in FingerprintJS
  const networkSources = [
    'cookiesEnabled', // Cookie state could be linked to network identity
    'localStorage', // Could contain network identifiers
    'sessionStorage', // Could contain network identifiers
    'indexedDB', // Could store network-related data
    'openDatabase' // Could store network-related data
  ]

  // Combine both removal lists
  const removeSources = [...unstableSources, ...networkSources]

  // Remove all specified sources from the filtered components
  for (const source of removeSources) {
    delete (filteredComponents as any)[source]
  }

  // Generate a visitor ID using only the stable components
  return {
    browserId: FingerprintJS.hashComponents(filteredComponents),
    components: filteredComponents
  }
}

// Return memory in GB
function getMemoryInfo(): number {
  try {
    const memory = (navigator as any).deviceMemory
    if (memory) return memory

    // Fallback to performance memory if available
    const performanceMemory = (performance as any).memory
    if (performanceMemory?.jsHeapSizeLimit) {
      return Math.round(performanceMemory.jsHeapSizeLimit / (1024 * 1024 * 1024))
    }

    return 0
  } catch {
    return 0
  }
}

function getScreenInfo(): {
  screen_width_px: number
  screen_height_px: number
  color_depth: number
  scale_factor: number
} {
  try {
    const width = window.screen.width
    const height = window.screen.height
    const colorDepth = window.screen.colorDepth
    const pixelRatio = window.devicePixelRatio

    return {
      screen_width_px: width,
      screen_height_px: height,
      color_depth: colorDepth,
      scale_factor: pixelRatio
    }
  } catch {
    return {
      screen_width_px: 0,
      screen_height_px: 0,
      color_depth: 0,
      scale_factor: 0
    }
  }
}

export async function getSystemInfo(): Promise<{
  cpu_cores: number
  memory_gb: number
}> {
  const deviceInfo = {
    cpu_cores: navigator.hardwareConcurrency || 1,
    memory_gb: getMemoryInfo()
  }

  return deviceInfo
}

function generateClientToken(deviceInfo: DeviceInfo): string {
  const payload = {
    client_app_id: CLIENT_APP_ID,
    timestamp: Date.now(),
    device_info: deviceInfo
  }

  if (!TELEGRAM_CLIENT_SECRET) {
    throw new Error('TELEGRAM_CLIENT_SECRET is not set')
  }

  // Use json-stable-stringify to ensure consistent string representation
  const payloadString = stringify(payload)

  const signature = CryptoJS.HmacSHA256(payloadString, TELEGRAM_CLIENT_SECRET).toString(
    CryptoJS.enc.Hex
  )

  const tokenPayload: ClientToken = {
    ...payload,
    signature
  }

  return btoa(stringify(tokenPayload))
}

export async function getFullDeviceInfo(): Promise<{
  deviceInfo: DeviceInfo
  clientToken: string
}> {
  const [systemInfo, browserFingerprint, screenInfo] = await Promise.all([
    getSystemInfo(),
    getBrowserFingerprint(),
    getScreenInfo()
  ])

  const deviceInfo: DeviceInfo = {
    ...systemInfo,
    ...screenInfo,
    device_type: DeviceType.TELEGRAM,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    browser_id: browserFingerprint.browserId
  }

  const clientToken = generateClientToken(deviceInfo)

  return {
    deviceInfo,
    clientToken
  }
}
