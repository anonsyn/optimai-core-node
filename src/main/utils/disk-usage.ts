import fs from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** index
  const fixed = value >= 10 || index === 0 ? 0 : 1
  return `${value.toFixed(fixed)} ${units[index]}`
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars)}\n... (truncated, ${text.length} chars total)`
}

export type DirectorySizeResult = {
  bytes: number
  entries: number
  truncated: boolean
  durationMs: number
}

export async function getDirectorySizeBytes(
  rootPath: string,
  options?: {
    maxEntries?: number
    maxDurationMs?: number
    maxDepth?: number
  }
): Promise<DirectorySizeResult> {
  const maxEntries = Math.max(1, options?.maxEntries ?? 75_000)
  const maxDurationMs = Math.max(100, options?.maxDurationMs ?? 2_000)
  const maxDepth = Math.max(1, options?.maxDepth ?? 25)

  const start = Date.now()
  let bytes = 0
  let entries = 0
  let truncated = false

  const stack: Array<{ dir: string; depth: number }> = [{ dir: rootPath, depth: 0 }]

  while (stack.length > 0) {
    if (entries >= maxEntries || Date.now() - start > maxDurationMs) {
      truncated = true
      break
    }

    const current = stack.pop()
    if (!current) break

    if (current.depth > maxDepth) {
      truncated = true
      continue
    }

    let dirEntries: Array<Dirent>
    try {
      dirEntries = await fs.readdir(current.dir, { withFileTypes: true })
    } catch {
      // Ignore unreadable paths
      continue
    }

    for (const entry of dirEntries) {
      if (entries >= maxEntries || Date.now() - start > maxDurationMs) {
        truncated = true
        break
      }

      entries += 1
      const fullPath = path.join(current.dir, entry.name)

      if (entry.isSymbolicLink()) {
        continue
      }

      if (entry.isDirectory()) {
        stack.push({ dir: fullPath, depth: current.depth + 1 })
        continue
      }

      if (entry.isFile()) {
        try {
          const stat = await fs.stat(fullPath)
          bytes += stat.size
        } catch {
          // Ignore stat failures
        }
      }
    }
  }

  return { bytes, entries, truncated, durationMs: Date.now() - start }
}
