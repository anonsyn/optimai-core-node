import { getCoreNodeUpdateGate, type UpdatePlatform } from '@/api/updates'
import { getOS, OS } from '@/utils/os'

const DIRECT_CHECK_BACKOFF_MS = 5 * 60 * 1000
const UPDATE_RETRY_MS = 5 * 60 * 1000

type GateResult =
  | { shouldCheckUpdater: false; reason: 'up_to_date' | 'be_error' | 'cooldown' }
  | { shouldCheckUpdater: true; latestVersion: string }

const state = {
  lastTriggeredVersion: '' as string | null,
  lastTriggeredAt: 0,
  nextAllowedDirectCheckAt: 0,
  consecutiveFailures: 0
}

const normalizeVersion = (value: string): number[] =>
  value
    .trim()
    .split('.')
    .map((part) => Number(part.replace(/[^0-9]/g, '')) || 0)

const compareVersions = (current: string, latest: string): number => {
  const a = normalizeVersion(current)
  const b = normalizeVersion(latest)
  const maxLen = Math.max(a.length, b.length)
  for (let i = 0; i < maxLen; i += 1) {
    const left = a[i] ?? 0
    const right = b[i] ?? 0
    if (left !== right) {
      return left > right ? 1 : -1
    }
  }
  return 0
}

const getPlatform = (): UpdatePlatform => {
  const os = getOS()
  if (os === OS.MAC) return 'mac'
  if (os === OS.LINUX) return 'linux'
  return 'win'
}

export const shouldCheckForUpdates = async (): Promise<GateResult> => {
  const platform = getPlatform()
  try {
    const gate = await getCoreNodeUpdateGate(platform)
    state.consecutiveFailures = 0
    state.nextAllowedDirectCheckAt = 0

    const current = APP_VERSION
    const isNewer = compareVersions(current, gate.latestVersion) < 0
    if (!isNewer) {
      return { shouldCheckUpdater: false, reason: 'up_to_date' }
    }

    const now = Date.now()
    if (
      state.lastTriggeredVersion === gate.latestVersion &&
      now - state.lastTriggeredAt < UPDATE_RETRY_MS
    ) {
      return { shouldCheckUpdater: false, reason: 'cooldown' }
    }

    state.lastTriggeredVersion = gate.latestVersion
    state.lastTriggeredAt = now
    return { shouldCheckUpdater: true, latestVersion: gate.latestVersion }
  } catch (error) {
    state.consecutiveFailures += 1
    const now = Date.now()
    if (now < state.nextAllowedDirectCheckAt) {
      return { shouldCheckUpdater: false, reason: 'cooldown' }
    }

    state.nextAllowedDirectCheckAt = now + DIRECT_CHECK_BACKOFF_MS
    return { shouldCheckUpdater: true, latestVersion: '' }
  }
}
