import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "./App.scss"
import CustomAppBar from './components/AppBar/AppBar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomAppBar></CustomAppBar>
    <App />
  </StrictMode>,
)
