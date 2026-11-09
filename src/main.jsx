import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ApiFaultNotice } from './components/layout/ApiFaultNotice.jsx'
import { ErrorBoundary } from './components/layout/ErrorBoundary.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <ApiFaultNotice />
    </BrowserRouter>
  </StrictMode>,
)
