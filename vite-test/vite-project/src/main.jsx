import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'

// Vendor CSS first, ours after - otherwise ours cannot override it.
//
// Bootstrap used to be imported from inside Header.js, which put it *after*
// App.css in the bundle. Bootstrap 5 underlines every link by default, so its
// `a { text-decoration: underline }` landed on top of the theme's
// `a { text-decoration: none }` and underlined the whole site: the mega menu,
// blog cards, the Get Free Quote button, everything.
import 'bootstrap/dist/css/bootstrap.min.css'

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
