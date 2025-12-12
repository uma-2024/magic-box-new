import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { saveFilePlugin } from './vite-plugin-save-file'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveFilePlugin()],
  resolve: {
    alias: {
      'next/navigation': path.resolve(__dirname, './src/mocks/next-navigation.ts'),
    },
  },
})
