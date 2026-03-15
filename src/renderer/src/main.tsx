import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import LicenseGate from './components/LicenseGate'
import './app.css'
import './editor.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LicenseGate>
      <App />
    </LicenseGate>
  </React.StrictMode>
)
