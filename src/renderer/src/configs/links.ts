import { BASE_DASHBOARD_URL } from '@/configs/env'

const createHref = (url: string) => {
  return url.replace(/([^:])\/+/g, '$1/')
}

export const EXTERNAL_LINKS = {
  HOME: 'https://optimai.network/',
  SOCIALS: {
    X: 'https://x.com/OptimaiNetwork',
    TELEGRAM: 'https://t.me/optimainetwork',
    GITHUB: 'https://github.com/OptimaiNetwork',
    DISCORD: 'https://discord.gg/j9wtCzeH6R'
  },
  DASHBOARD: {
    HOME: createHref(`${BASE_DASHBOARD_URL}/`),
    REGISTER: createHref(`${BASE_DASHBOARD_URL}/register`),
    FORGOT_PASSWORD: createHref(`${BASE_DASHBOARD_URL}/forgot-password`)
  },
  POLICY: {
    TOS: createHref(`${BASE_DASHBOARD_URL}/term-of-services`),
    PRIVACY: createHref(`${BASE_DASHBOARD_URL}/privacy-policy`)
  }
}
