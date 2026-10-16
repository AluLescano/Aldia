// DEPENDENCIES
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// COMPONENTS
import App from './App.tsx'

// ASSETS: global styles, loaded once for the whole app
import './styles/_themes.scss'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'

/**
 * Entry point: mounts the app in `#root` (index.html). `StrictMode` runs some checks
 * twice in development only, to surface bugs early; it does nothing in the real build.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
