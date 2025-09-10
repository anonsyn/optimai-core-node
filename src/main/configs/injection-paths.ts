import { app } from 'electron'
import path from 'path'

const getInjectionPath = (appName: string) => {
  if (app.isPackaged) {
    // In production, injections are in extraResources
    return path.join(process.resourcesPath, 'injections', appName, `injection-${appName}.js`)
  } else {
    // In development, use the built files in centralized dist folder
    return path.join(
      __dirname,
      '..',
      '..',
      '..',
      'injections',
      'dist',
      appName,
      `injection-${appName}.js`
    )
  }
}

export const X_INJECTION_SCRIPT_PATH = getInjectionPath('x')
export const PANCAKESWAP_INJECTION_SCRIPT_PATH = getInjectionPath('pancakeswap')
export const LINKEDIN_INJECTION_SCRIPT_PATH = getInjectionPath('linkedin')
export const GOOGLE_INJECTION_SCRIPT_PATH = getInjectionPath('google')
