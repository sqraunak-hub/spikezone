import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.js'
import { API_BASE_URL } from './Utils/appConstant'
import './index.css'

// Nine call sites use a bare relative path (axios.get("uploadCategory/")), so
// they depend on this default being set. It used to be set as a side effect of
// importing Services/HttpService.js, which only happened because SignUp
// pulled in authService — an accident that broke the moment the screens were
// code-split and SignUp stopped loading on first paint. Without it the
// requests resolve against the site origin, the SPA rewrite answers with
// index.html, and `categories.map` blows up on an HTML string.
axios.defaults.baseURL = API_BASE_URL

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
