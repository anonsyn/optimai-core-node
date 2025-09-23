type LogLevel = 'loading' | 'info' | 'success' | 'error' | 'debug'

/**
 * Common Terminal API used across all injection apps
 */
const terminalApi = {
  show: () => {
    return `
      if (window.terminalApi && typeof window.terminalApi.show === 'function') {
        window.terminalApi.show();
      }
    `
  },

  hide: () => {
    return `
      if (window.terminalApi && typeof window.terminalApi.hide === 'function') {
        window.terminalApi.hide();
      }
    `
  },

  addLog: (message: string, level: LogLevel = 'info', animated: boolean = false) => {
    return `
      if (window.terminalApi && typeof window.terminalApi.addLog === 'function') {
        window.terminalApi.addLog(${JSON.stringify(message)}, ${JSON.stringify(level)}, ${JSON.stringify(animated)});
      }
    `
  },

  clearLogs: () => {
    return `
      if (window.terminalApi && typeof window.terminalApi.clearLogs === 'function') {
        window.terminalApi.clearLogs();
      }
    `
  },

  setProcessing: (processing: boolean) => {
    return `
      if (window.terminalApi && typeof window.terminalApi.setProcessing === 'function') {
        window.terminalApi.setProcessing(${JSON.stringify(processing)});
      }
    `
  }
}

export default terminalApi
export type { LogLevel }
