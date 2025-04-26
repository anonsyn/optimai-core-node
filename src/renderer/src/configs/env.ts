// URLS
const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://api.optimai.network'
const BASE_DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'https://node.optimai.network'
const BASE_LP_URL = import.meta.env.VITE_LP_URL || 'https://optimai.network'

const DEVICE_SECRET = import.meta.env.VITE_DEVICE_SECRET || 'mob-secret-key'
const CLIENT_APP_ID = import.meta.env.VITE_CLIENT_APP_ID || ''

export { BASE_API_URL, BASE_DASHBOARD_URL, BASE_LP_URL, CLIENT_APP_ID, DEVICE_SECRET }
