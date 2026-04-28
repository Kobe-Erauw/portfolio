import { fileURLToPath, URL } from 'node:url'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const BASE_URL = 'https://kobeerauw.com'
const GITHUB_USER = 'kobe-erauw'

interface GithubRepo {
  name: 