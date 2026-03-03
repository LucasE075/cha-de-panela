import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// App is located under the "app" subfolder
import App from './app/App.jsx'

import './styles/globals.css'
import './styles/theme.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Vite defines BASE_URL based on `vite.config.js.base` (e.g. '/cha-de-panela/').
  // In development this is usually '/', but the dev server prints the correct
  // URL above when you run `npm run dev`.  The logic below ensures the app
  // still renders if somebody accidentally opens the server root instead of
  // the base path.
  <BrowserRouter basename={import.meta.env.BASE_URL || '/'}>
    <App />
  </BrowserRouter>
)
