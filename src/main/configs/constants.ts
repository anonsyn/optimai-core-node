import { is } from '@electron-toolkit/utils'

export const IS_DEV = is.dev

export const IS_PROD = !IS_DEV

export const API_SERVER_PORT = 5000
