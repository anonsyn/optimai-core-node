// Provider exports
export {
  OverlayProvider,
  useOverlayState,
  useOverlayApi,
  type OverlayState,
  type OverlayApi
} from './providers/overlay'

// Component exports
export { default as Overlay } from './components/overlay'

// Hook exports
export { useInjectOverlayApi } from './hooks/use-inject-overlay-api'