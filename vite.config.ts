import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Envision 3D kitchen visualizer — Vite + React + Three.js
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  // The GLB lives in /public and is fetched at runtime by URL, so no asset
  // import handling is needed here.
})
