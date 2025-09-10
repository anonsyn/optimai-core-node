import App from '@/main'
import { AppProviders } from '@/providers'
import { createRoot } from 'react-dom/client'
import tailwindcssOutput from './styles.css?inline'

// Create root element for extension
const root = document.createElement('div')
root.id = 'extension-root'
document.body.append(root)

// Create shadow DOM container
const rootIntoShadow = document.createElement('div')
rootIntoShadow.id = 'agent-shadow-root'
rootIntoShadow.style.position = 'fixed'
rootIntoShadow.style.inset = '0'
rootIntoShadow.style.zIndex = '9999'
rootIntoShadow.style.overflow = 'hidden'
rootIntoShadow.style.pointerEvents = 'auto'

// Attach shadow root
const shadowRoot = root.attachShadow({ mode: 'open' })

// Add styles to shadow DOM (use <style> to avoid Constructable Stylesheet limitations)
const styleElement = document.createElement('style')
styleElement.textContent = tailwindcssOutput
shadowRoot.appendChild(styleElement)

shadowRoot.appendChild(rootIntoShadow)

// Render React app
createRoot(rootIntoShadow).render(
  <AppProviders>
    <App />
  </AppProviders>
)
