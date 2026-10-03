import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { prerenderPlugin } from './build/prerender'

// https://vite.dev/config/
export default defineConfig({
  // prerenderPlugin writes a static HTML page per project + sitemap.xml after the build
  plugins: [vue(), vueDevTools(), prerenderPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
