<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useQuery } from '@pinia/colada'
import { fetchReadme, fetchRepository } from '../services/github'
import { marked } from 'marked'
import { computed } from 'vue'

const route = useRoute()
const repoName = route.params.name as string
const username = 'kobe-erauw'

// Fetch Repo Details (voor default branch)
const { data: repoDetails } = useQuery({
  key: ['repo', repoName],
  query: () => fetchRepository(repoName),
  staleTime: 1000 * 60,
})

// Fetch Readme
const { data: readmeContent, status, error } = useQuery({
  key: ['readme', repoName],
  query: () => fetchReadme(repoName),
  staleTime: 1000 * 60,
})

const parsedReadme = computed(() => {
  if (!readmeContent.value) return ''

  const branch = repoDetails.value?.default_branch || 'main'

  const renderer = new marked.Renderer()

  // Rewrite image URLs
  renderer.image = ({ href, title, text }) => {
    if (href && !href.startsWith('http') && !href.startsWith('//')) {
      const cleanPath = href.replace(/^\.?\//, '')
      href = `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${cleanPath}`
    }
    return `<img src="${href}" alt="${text}" title="${title || ''}" class="img-fluid" />`
  }

  return marked.parse(readmeContent.value, { renderer })
})
</script>

<template>
  <div class="container py-5">
    <router-link to="/" class="btn btn-outline-secondary mb-4">&larr; Terug naar overzicht</router-link>

    <div v-if="status === 'pending'" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Laden...</span>
      </div>
    </div>

    <div v-else-if="status === 'error'" class="alert alert-danger">
      Kon de details niet laden: {{ error?.message }}
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
         <h1>{{ repoName }}</h1>
         <a v-if="repoDetails" :href="repoDetails.html_url" target="_blank" class="btn btn-dark d-flex align-items-center gap-2">
           <i class="bi bi-github"></i>
           <span>Bekijk op GitHub</span>
           <span class="vr mx-1"></span>
           <span><i class="bi bi-star-fill text-warning"></i> {{ repoDetails.stargazers_count }}</span>
         </a>
      </div>

      <div v-if="!readmeContent" class="alert alert-warning">
        Dit project heeft geen README bestand.
      </div>

      <div v-else class="readme-content p-4 border rounded bg-light" v-html="parsedReadme"></div>
    </div>
  </div>
</template>

<style scoped>
.readme-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.readme-content :deep(pre) {
  background-color: #000;
  color: #e0e0e0;
  border: 1px solid #333;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}
.readme-content :deep(code) {
  color: #00ff00; /* Keep code green for readability against black */
  font-family: 'Courier New', monospace;
}
.readme-content :deep(pre code) {
  color: inherit;
}
.readme-content :deep(h1), .readme-content :deep(h2) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #333; /* Subtle border */
    padding-bottom: 0.5rem;
    color: #e0e0e0; /* Normal text color */
    font-family: 'Courier New', monospace;
}
.readme-content :deep(blockquote) {
    border-left: 3px solid #00ff00;
    padding-left: 1rem;
    color: #a0a0a0; /* Muted text */
}
</style>
