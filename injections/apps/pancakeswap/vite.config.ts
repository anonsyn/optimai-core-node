import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'PancakeSwapInjection',
      formats: ['iife'],
      fileName: () => 'injection-pancakeswap.js'
    },
    outDir: '../../dist/pancakeswap',
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'PancakeSwapInjection',
        globals: {}
      }
    },
    minify: true,
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': process.env.__DEV__ === 'true' ? `"development"` : `"production"`
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
