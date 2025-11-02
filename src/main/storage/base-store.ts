import crypto from 'crypto'
import { app } from 'electron'
import Store from 'electron-store'
import path from 'path'
import { IS_STAGING } from '../configs/constants'
import type { StoreOptions } from './types'

export type PersistentStore<T extends Record<string, any>> = {
  get<K extends keyof T>(key: K): T[K] | undefined
  set<K extends keyof T>(key: K, value: T[K]): void
  has(key: keyof T): boolean
  clear(): void
  onDidAnyChange(callback: () => void): () => void
  onDidChange<K extends keyof T>(key: K, callback: (value: T[K]) => void): () => void
}

/**
 * Create an encrypted store instance
 */
export function createStore<T extends Record<string, any>>(
  options: StoreOptions<T>
): PersistentStore<T> {
  // Generate or use provided encryption key
  const encryptionKey = options.encryptionKey || generateEncryptionKey(options.name)

  const store = new Store<T>({
    name: options.name,
    encryptionKey,
    defaults: options.defaults || ({} as T),
    cwd: path.join(
      app.getPath('userData'),
      IS_STAGING ? 'secure-storage-staging' : 'secure-storage'
    ),
    clearInvalidConfig: true,
    accessPropertiesByDotNotation: true
  })

  return store as unknown as PersistentStore<T>
}

/**
 * Generate a deterministic encryption key based on store name
 */
function generateEncryptionKey(storeName: string): string {
  const salt = 'OptimAI-Core-Node-2024'
  return crypto.createHash('sha256').update(`${app.getName()}-${storeName}-${salt}`).digest('hex')
}
