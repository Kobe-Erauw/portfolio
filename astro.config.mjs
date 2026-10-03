// @ts-check
import { defineConfig } from 'astro/config'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://kobeerauw.com',
  // Write /project/foo as dist/project/foo.html: Cloudflare Pages serves that at
  // /project/foo without a trailing slash, so the URLs stay the same as before.
  build: { format: 'file' },
  trailingSlash: 'never',
})
