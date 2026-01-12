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
})

// Fetch Readme
const { data: readmeContent, status, error } = useQuery({
  key: ['readme', repoName],
  query: () => fetchReadme(repoName),
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
         <a v-if="repoDetails" :href="repoDetails.html_url" target="_blank" class="btn btn-dark">
           <i class="bi bi-github"></i> Bekijk op GitHub
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
  background-color: #212529; /* Dark background for code blocks */
  color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}
.readme-content :deep(code) {
  color: #d63384; /* Bootstrap pink for inline code */
}
.readme-content :deep(pre code) {
  color: inherit; /* Code inside pre blocks inherits light color */
}
.readme-content :deep(h1), .readme-content :deep(h2) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 0.5rem;
}
.readme-content :deep(blockquote) {
    border-left: 4px solid #dee2e6;
    padding-left: 1rem;
    color: #6c757d;
}
</style>
