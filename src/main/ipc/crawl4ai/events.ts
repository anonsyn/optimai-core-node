export const Crawl4AiEvents = {
  CheckAvailability: 'crawl4ai:check-availability',
  CheckDockerStatus: 'crawl4ai:check-docker-status',
  Initialize: 'crawl4ai:initialize',
  CheckHealth: 'crawl4ai:check-health',
  Stop: 'crawl4ai:stop',
  GetLogs: 'crawl4ai:get-logs',
  OpenDockerGuide: 'crawl4ai:open-docker-guide',

  // Events
  OnInitProgress: 'crawl4ai:on-init-progress',
  OnStatusChange: 'crawl4ai:on-status-change'
} as const