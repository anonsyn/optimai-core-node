import App from '@/main'
import { createRoot } from 'react-dom/client'
import tailwindcssOutput from './styles.css?inline'

const root = document.createElement('div')
root.id = 'optimai-extension-root'

document.body.append(root)

const rootIntoShadow = document.createElement('div')
rootIntoShadow.id = 'agent-shadow-root'
rootIntoShadow.style.position = 'fixed'
rootIntoShadow.style.pointerEvents = 'none'
rootIntoShadow.style.inset = '0'
rootIntoShadow.style.zIndex = '9999'
rootIntoShadow.style.overflow = 'hidden'

const shadowRoot = root.attachShadow({ mode: 'open' })

if (navigator.userAgent.includes('Firefox')) {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = tailwindcssOutput
  shadowRoot.appendChild(styleElement)
} else {
  const globalStyleSheet = new CSSStyleSheet()
  globalStyleSheet.replaceSync(tailwindcssOutput)
  shadowRoot.adoptedStyleSheets = [globalStyleSheet]
}

shadowRoot.appendChild(rootIntoShadow)

createRoot(rootIntoShadow).render(<App />)
