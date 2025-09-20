import crypto from 'crypto'
import { app } from 'electron'
import Store from 'electron-store'
import path from 'path'
import type { StoreOptions } from './types'

/**
 * Create an encrypted store instance
 */
export function createStore<T extends Record<string, any>>(options: StoreOptions<T>) {
  // Generate or use provided encryption key
  const encryptionKey = options.encryptionKey || generateEncryptionKey(options.name)

  return new Store<T>({
    name: options.name,
    encryptionKey,
    defaults: options.defaults || ({} as T),
    cwd: path.join(app.getPath('userData'), 'secure-storage'),
    clearInvalidConfig: true,
    accessPropertiesByDotNotation: true
  })
}

/**
 * Generate a deterministic encryption key based on store name
 */
function generateEncryptionKey(storeName: string): string {
  const salt = 'OptimAI-Core-Node-2024'
  return crypto.createHash('sha256').update(`${app.getName()}-${storeName}-${salt}`).digest('hex')
}
