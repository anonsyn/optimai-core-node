export const DockerEvents = {
  CheckInstalled: 'docker:check-installed',
  CheckRunning: 'docker:check-running',
  GetInfo: 'docker:get-info',
  CheckContainer: 'docker:check-container',
  GetContainerStatus: 'docker:get-container-status',
  GetContainerLogs: 'docker:get-container-logs',
  ListContainers: 'docker:list-containers',
  OpenInstallGuide: 'docker:open-install-guide',
  DownloadInstaller: 'docker:download-installer',
  OpenInstaller: 'docker:open-installer',
  GetInstallerPath: 'docker:get-installer-path',
  OnDownloadProgress: 'docker:download-progress'
} as const
