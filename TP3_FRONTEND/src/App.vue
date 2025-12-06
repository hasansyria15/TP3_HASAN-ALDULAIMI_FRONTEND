<script setup>
import { RouterView } from 'vue-router'
import AppNavigation from './components/partiels/AppNavigation.vue'
</script>

<template>
  <div>
    <AppNavigation />
    <main class="container mt-4">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>

</style>
