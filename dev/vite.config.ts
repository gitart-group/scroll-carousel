import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import WindiCSS from 'vite-plugin-windicss'
import Checker from 'vite-plugin-checker'

const resolve = (str: string) => path.resolve(__dirname, str)

export default defineConfig({
  root: resolve('.'),

  plugins: [
    vue(),
    Checker({
      vueTsc: true,
      overlay: false,
    }),
    AutoImport({
      imports: [
        'vue',
        // {
        //   'component-path': [
        //     'dialogInjectionKey',
        //     ['plugin', 'dialogPlugin'],
        //   ],
        // },
      ],
      dts: resolve('auto-imports.d.ts'),
    }),
    Components({
      resolvers: [
        (name: string) => {
          if ([
            'GSCarousel',
          ].includes(name))
            return { importName: name, path: 'gitart-scroll-carousel' }

          return null
        },
      ],
      dts: resolve('components.d.ts'),
    }),
    WindiCSS({
      config: resolve('windi.config.ts'),
    }),
  ],

  server: {
    fs: {
      strict: false,
      allow: [resolve('..')],
    },
  },

  resolve: {
    alias: {
      'gitart-scroll-carousel': resolve('../src/index.ts'),
      'gitart-scroll-carousel/': resolve('../src/'),
    },
  },

  build: {
    sourcemap: true,
  },
})
