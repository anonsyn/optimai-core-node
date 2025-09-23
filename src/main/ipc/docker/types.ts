export interface DockerStatus {
  installed: boolean
  running: boolean
  version?: string
  error?: string
}

export interface DockerInfo {
  version?: string
  serverVersion?: string
  apiVersion?: string
}

export interface ContainerStatus {
  id?: string
  name: string
  image: string
  status: 'running' | 'exited' | 'created' | 'paused' | 'unknown'
  ports?: string[]
}
