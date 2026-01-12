<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Portfolio</a>
      </div>
    </nav>
  </header>

  <RouterView />

  <footer class="footer mt-auto py-3 bg-light text-center">
    <div class="container">
      <span class="text-muted">© 2026 Kobe Erauw</span>
    </div>
  </footer>
</template>

<style>
/* Global styles can go here or in assets/main.css */
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>