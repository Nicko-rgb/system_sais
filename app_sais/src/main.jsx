import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('react-sais')).render(
// createRoot(document.getElementById('react-section')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
