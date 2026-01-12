<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { fetchRepositories } from '../services/github'

const { data: repositories, status, error } = useQuery({
  key: ['repos'],
  query: fetchRepositories,
})
</script>

<template>
  <div class="container py-5">
    <h2 class="mb-4 text-center">Mijn Projecten</h2>

    <div v-if="status === 'pending'" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Laden...</span>
      </div>
    </div>

    <div v-else-if="status === 'error'" class="alert alert-danger" role="alert">
      Er is een fout opgetreden bij het laden van de projecten: {{ error?.message }}
    </div>

    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="repo in repositories" :key="repo.id" class="col">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ repo.name }}</h5>
            <h6 class="card-subtitle mb-2 text-muted" v-if="repo.language">{{ repo.language }}</h6>
            <p class="card-text flex-grow-1">
              {{ repo.description || 'Geen beschrijving beschikbaar.' }}
            </p>
            <div class="mt-3 d-flex justify-content-between align-items-center">
              <router-link :to="{ name: 'project-detail', params: { name: repo.name } }" class="btn btn-primary btn-sm">Bekijk Details</router-link>
              <a :href="repo.html_url" target="_blank" class="btn btn-outline-secondary btn-sm" title="Bekijk op GitHub"><i class="bi bi-github"></i> GitHub</a>
            </div>
            <div class="mt-2 text-end">
              <span class="badge bg-secondary">
                <i class="bi bi-star-fill"></i> ⭐ {{ repo.stargazers_count }}
              </span>
            </div>
          </div>
          <div class="card-footer text-muted small">
            Laatst geüpdatet: {{ new Date(repo.updated_at).toLocaleDateString('nl-NL') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
</style>
