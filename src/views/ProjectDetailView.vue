<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useQuery } from '@pinia/colada'
import { fetchReadme, fetchRepository } from '../services/github'
import { computed, watchEffect, onUnmounted } from 'vue'
import DOMPurify from 'dompurify'
import { setTitle, setMetaName, setMetaProperty, setCanonical, injectJsonLd, removeJsonLd } from '../utils/seo'
import {
  projectBreadcrumbJsonLd,
  projectDescription,
  projectJsonLd,
  projectTitle,
  projectUrl,
} from '../utils/projects'
import { renderReadme } from '../utils/markdown'
import { getPrerenderData } from '../utils/prerender'

const route = useRoute()
const repoName = route.params.name as string

// When this page was prerendered (build/prerender.ts) the repo and README are
// embedded in the HTML, so render them straight away and refresh in the background.
const prerendered = getPrerenderData()
const initial = prerendered?.project?.repo.name === repoName ? prerendered.project : undefined

// Fetch Repo Details (for default branch)
const { data: repoDetails } = useQuery({
  key: ['repo', repoName],
  query: () => fetchRepository(repoName),
  staleTime: 1000 * 60,
  initialData: () => initial?.repo,
  initialDataUpdatedAt: prerendered?.builtAt,
})

// Fetch Readme
const { data: readmeContent, status, error } = useQuery({
  key: ['readme', repoName],
  query: () => fetchReadme(repoName),
  staleTime: 1000 * 60,
  initialData: () => initial?.readme,
  initialDataUpdatedAt: prerendered?.builtAt,
})

const parsedReadme = computed(() => {
  if (!readmeContent.value) return ''
  const branch = repoDetails.value?.default_branch || 'main'
  return DOMPurify.sanitize(renderReadme(readmeContent.value, repoName, branch))
})

// Navigation tags are set immediately (don't depend on API data).
// Everything here must match the <head> that build/prerender.ts writes.
watchEffect(() => {
  const title = projectTitle(repoName, readmeContent.value)
  setTitle(title)
  setMetaProperty('og:title', title)
  setMetaProperty('og:url', projectUrl(repoName))
  setCanonical(projectUrl(repoName))
})

// Description and structured data are set once the GitHub API has responded,
// so Google always sees the real project description rather than a fallback.
watchEffect(() => {
  if (!repoDetails.value) return

  const description = projectDescription(repoDetails.value, readmeContent.value)
  setMetaName('description', description)
  setMetaProperty('og:description', description)

  injectJsonLd('project-detail', projectJsonLd(repoDetails.value, readmeContent.value))
  injectJsonLd('breadcrumbs', projectBreadcrumbJsonLd(repoDetails.value, readmeContent.value))
})

// No title/description reset here: this hook runs after the next view has already
// set its own tags, so resetting would overwrite them.
onUnmounted(() => {
  removeJsonLd('project-detail')
  removeJsonLd('breadcrumbs')
})
</script>

<template>
  <div class="container py-5">
    <router-link to="/" class="btn btn-outline-secondary mb-4">&larr; Back to overview</router-link>

    <div v-if="status === 'pending'" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="status === 'error' && readmeContent === undefined" class="alert alert-danger">
      Could not load details: {{ error?.message }}
    </div>

    <!-- Markup mirrored in build/prerender.ts (projectBody) -->
    <div v-else>
      <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
         <h1 class="m-0 text-break">{{ repoName }}</h1>
         <a v-if="repoDetails" :href="repoDetails.html_url" target="_blank" class="btn btn-dark d-flex align-items-center gap-2 flex-shrink-0">
           <i class="bi bi-github"></i>
           <span class="d-none d-md-inline">View on GitHub</span>
           <span class="vr mx-1 d-none d-md-inline"></span>
           <span><i class="bi bi-star-fill text-warning"></i> {{ repoDetails.stargazers_count }}</span>
         </a>
      </div>

      <div v-if="!readmeContent" class="alert alert-warning">
        This project has no README file.
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
