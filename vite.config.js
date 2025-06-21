import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        background: 'src/background.js',
        contentScript: 'src/contentScript.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          if (chunkInfo.name === 'contentScript') {
            return 'contentScript.js'
          }
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
