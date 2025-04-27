import { BASE_DASHBOARD_URL } from '@/configs/env'

export const PATHS = {
  START_UP: '/',

  LOGIN: '/login',

  HOME: '/home',

  PROFILE: '/profile',

  NODE_OPERATOR: '/node-operator',
  DATA_OPERATOR: '/data-operator',
  DATA_SCRAPPING: '/data-operator/data-scrapping',
  NODE_AVAILABILITY: '/node-operator/node-availability',
  MISSIONS_REWARDS: '/missions-rewards',
  REF: '/ref'
}

const createHref = (url: string) => {
  return url.replace(/([^:])\/+/g, '$1/')
}

export const EXTERNAL_LINKS = {
  HOME: 'https://optimai.network/',
  SOCIALS: {
    X: 'https://x.com/OptimaiNetwork',
    TELEGRAM: 'https://t.me/optimainetwork',
    GITHUB: 'https://github.com/OptimaiNetwork'
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
