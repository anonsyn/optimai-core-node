export interface Crawl4AiStatus {
  dockerInstalled: boolean
  dockerRunning: boolean
  initialized: boolean
  healthy: boolean
  port?: number
  error?: string
}

export interface InitProgress {
  status: 'checking' | 'pulling' | 'starting' | 'ready' | 'error'
  progress?: number
  message?: string
  error?: string
}

export interface ServiceInfo {
  initialized: boolean
  baseUrl?: string
  port?: number
  containerName: string
  imageName: string
  error?: string
}