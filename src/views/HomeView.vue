<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProjectList from '../components/ProjectList.vue'

const typedText = ref('')
const fullText = "Software & AI student aan Odisee Gent. Gefascineerd door fullstack development, IoT en low-level code."
const typingSpeed = 50

const typeText = () => {
  let i = 0
  const interval = setInterval(() => {
    if (i < fullText.length) {
      typedText.value += fullText.charAt(i)
      i++
    } else {
      clearInterval(interval)
    }
  }, typingSpeed)
}

onMounted(() => {
  typeText()
})
</script>

<template>
  <main>
    <div class="px-4 py-5 my-5 text-center">
      <h1 class="display-5 fw-bold"><span class="text-accent">&gt;</span> Kobe Erauw</h1>
      <div class="col-lg-6 mx-auto">
        <!-- Container prevents layout shift by reserving space -->
        <div class="typewriter-container lead mb-4">
          <!-- Invisible ghost text to set the height -->
          <div class="ghost-text" aria-hidden="true">
            {{ fullText }}<span class="cursor">_</span>
          </div>
          <!-- Visible typing text overlaid exactly on top -->
          <div class="typing-text">
            {{ typedText }}<span class="cursor">_</span>
          </div>
        </div>
      </div>
    </div>
    <ProjectList />
  </main>
</template>

<style scoped>
.text-accent {
  color: var(--retro-accent);
}

.typewriter-container {
  position: relative;
  font-family: var(--retro-font-mono);
  /* Ensure the container aligns its children correctly */
}

.ghost-text {
  visibility: hidden;
  /* Keep it in the flow to reserve space */
}

.typing-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cursor {
  display: inline-block;
  color: var(--retro-accent);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
