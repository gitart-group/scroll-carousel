import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const resolve = (str: string) => path.resolve(__dirname, '../', str)

const chunks = [
  'GSArrow',
  'GSLayoutNumeric',
  'GSLayoutDefault',
]

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    sourcemap: true,

    lib: {
      entry: resolve('src/index.ts'),
      formats: ['es'],
      name: 'index',
      fileName: format => format === 'es' ? 'index.mjs' : `index.${format}.js`,
    },

    cssCodeSplit: true,
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        manualChunks(id) {
          const chunk = chunks.find(c => id.includes(c))
          return chunk || null
        },
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
