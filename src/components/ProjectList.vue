<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { fetchRepositories } from '../services/github'
import { Tooltip } from 'bootstrap'
import type { DirectiveBinding } from 'vue'

const {
  data: repositories,
  status,
  error,
} = useQuery({
  key: ['repos'],
  query: fetchRepositories,
  staleTime: 1000 * 60,
})

const vTooltip = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    new Tooltip(el, {
      title: binding.value,
      trigger: 'hover focus',
      placement: 'top',
    })
  },
  beforeUnmount(el: HTMLElement) {
    const tooltip = Tooltip.getInstance(el)
    if (tooltip) {
      tooltip.dispose()
    }
  },
}
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

            <img
              v-if="repo.imageUrl"
              :src="repo.imageUrl"
              :alt="repo.name"
              class="img-fluid mb-3 rounded d-block mx-auto"
              style="max-height: 200px; object-fit: contain"
            />

            <p class="card-text flex-grow-1">
              {{ repo.description }}
            </p>
            <div class="mt-3 d-flex justify-content-between align-items-center">
              <router-link
                :to="{ name: 'project-detail', params: { name: repo.name } }"
                class="btn btn-primary btn-sm"
                >Bekijk Details</router-link
              >
              <a
                :href="repo.html_url"
                target="_blank"
                class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                title="Bekijk op GitHub"
              >
                <i class="bi bi-github"></i>
                <span>GitHub</span>
                <span class="vr mx-1"></span>
                <span
                  ><i class="bi bi-star-fill text-warning"></i> {{ repo.stargazers_count }}</span
                >
              </a>
            </div>
          </div>
          <div
            class="card-footer text-muted small d-flex justify-content-between align-items-center"
          >
            <span
              class="d-flex align-items-center tooltip-trigger"
              v-tooltip="'Aangemaakt op'"
              tabindex="0"
            >
              <i class="bi bi-calendar-plus me-1"></i>
              {{ new Date(repo.created_at).toLocaleDateString('nl-NL') }}
            </span>
            <span
              class="d-flex align-items-center tooltip-trigger"
              v-tooltip="'Laatste commit op'"
              tabindex="0"
            >
              <i class="bi bi-clock-history me-1"></i>
              {{ new Date(repo.pushed_at).toLocaleDateString('nl-NL') }}
            </span>
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

.tooltip-trigger {
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  cursor: help;
  transition: color 0.2s;
}

.tooltip-trigger:hover,
.tooltip-trigger:focus {
  color: var(--retro-accent, #00ff00);
}
</style>
