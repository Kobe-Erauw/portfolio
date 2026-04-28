import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const BASE_URL = 'https://kobeerauw.com'
const GITHUB_USER = 'kobe-erauw'

interface GithubRepo {
  name: string
  description: string | null
  pushed_at: string
}

/**
 * Fetches the GitHub repo list at build time and writes dist/sitemap.xml.
 * Falls back to homepage-only if the API is unreachable (e.g. rate limit).
 */
function generateSitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    async closeBundle() {
      let repos: GithubRepo[] = []

      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`,
        )
        if (!res.ok) throw new Error(`GitHub API responded with ${res.status}`)
        const data = (await res.json()) as GithubRepo[]
        repos = data.filter((r) => !r.description?.includes('[hidden]'))
      } catch (err) {
        console.warn(`\n⚠  sitemap: could not fetch repos (${err}) — homepage only\n`)
      }

      const today = new Date().toISOString().split('T')[0]

      const entries = [
        { loc: `${BASE_URL}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
        ...repos.map((r) => ({
          loc: `${BASE_URL}/project/${r.name}`,
          lastmod: r.pushed_at.split('T')[0],
          changefreq: 'monthly',
          priority: '0.8',
        })),
      ]

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map((e) =>
          [
            '  <url>',
            `    <loc>${e.loc}</loc>`,
            `    <lastmod>${e.lastmod}</lastmod>`,
            `    <changefreq>${e.changefreq}</changefreq>`,
            `    <priority>${e.priority}</priority>`,
            '  </url>',
          ].join('\n'),
        ),
        '</urlset>',
      ].join('\n')

      writeFileSync(resolve('dist/sitemap.xml'), xml, 'utf-8')
      console.log(`\n✓  sitemap.xml — ${entries.length} URLs written to dist/\n`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), generateSitemapPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
