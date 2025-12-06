<template>
  <BaseButton variant="outline-danger" @click="onLogout">
    Déconnexion
  </BaseButton>
</template>

<script setup>
import BaseButton from './BaseButton.vue'

const onLogout = () => {
  console.log('Déconnexion cliquée')
  // ici plus tard : appel au store Pinia pour logout
}
</script>
