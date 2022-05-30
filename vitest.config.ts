import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    Vue(),
    AutoImport({
      imports: ['vitest'],
      dts: 'tests/auto-imports.d.ts',
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
