<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Portfolio</a>
        <a
          href="https://www.linkedin.com/in/kobe-erauw"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link ms-auto d-flex align-items-center gap-2"
        >
          <i class="bi bi-linkedin"></i>
          <span>LinkedIn</span>
        </a>
      </div>
    </nav>
  </header>

  <div class="flex-grow-1">
    <RouterView />
  </div>

  <footer class="footer mt-auto py-3 bg-light text-center">
    <div class="container d-flex align-items-center justify-content-center gap-3">
      <span class="text-muted">© 2026 Kobe Erauw</span>
      <a
        href="https://www.linkedin.com/in/kobe-erauw"
        target="_blank"
        rel="noopener noreferrer"
        class="text-muted d-flex align-items-center gap-1"
      >
        <i class="bi bi-linkedin"></i>
        <span>LinkedIn</span>
      </a>
    </div>
  </footer>
</template>

<style>
/* Global styles can go here or in assets/main.css */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>