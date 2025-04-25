// URLS
const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.optimai.network'
const BASE_DASHBOARD_URL = process.env.EXPO_PUBLIC_DASHBOARD_URL || 'https://node.optimai.network'
const BASE_LP_URL = process.env.EXPO_PUBLIC_LP_URL || 'https://optimai.network'

const DEVICE_SECRET = process.env.EXPO_PUBLIC_DEVICE_SECRET || 'mob-secret-key'
const CLIENT_APP_ID = process.env.EXPO_PUBLIC_CLIENT_APP_ID || ''

export { BASE_API_URL, BASE_DASHBOARD_URL, BASE_LP_URL, CLIENT_APP_ID, DEVICE_SECRET }
