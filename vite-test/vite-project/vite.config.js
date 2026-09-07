import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

// Optional HTTPS for the dev server.
//
// Firebase phone auth refuses the reCAPTCHA token when the page is served over
// plain http://localhost - the send fails with INVALID_APP_CREDENTIAL while the
// exact same code works on a real https origin. Dropping a self-signed cert
// into .certs/ turns the dev server into https://localhost:5175 so that path
// can be exercised before deploying.
//
// Entirely opt-in: with no cert files present this is undefined and the dev
// server stays on http, so nobody has to generate certs to run the project.
// Nothing here affects `vite build` - `server` is dev-only config.
const certDir = path.resolve(__dirname, '.certs')
const keyFile = path.join(certDir, 'localhost-key.pem')
const certFile = path.join(certDir, 'localhost-cert.pem')
const https =
  fs.existsSync(keyFile) && fs.existsSync(certFile)
    ? { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
    : undefined

export default defineConfig({
  server: {
    https,
    // With the page on https, a direct call to the http API would be blocked as
    // mixed content. Proxying keeps the browser on one origin and lets Django
    // stay plain http locally. Set VITE_API_HOST to the dev server's own origin
    // to route through this.
    proxy: {
      '/api': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    },
  },

  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))  return null

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
  ],

  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})