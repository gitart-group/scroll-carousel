import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import WindiCSS from 'vite-plugin-windicss'

const resolve = (str: string) => path.resolve(__dirname, str)

export default defineConfig({
  root: resolve('.'),

  plugins: [
    vue(),
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
            'AComponent',
          ].includes(name))
            return { importName: name, path: 'component-path' }

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
      'component-path': resolve('../src/index.ts'),
    },
  },

  build: {
    sourcemap: true,
  },
})
