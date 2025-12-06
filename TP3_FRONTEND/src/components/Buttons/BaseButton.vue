<template>
  <button
    class="btn"
    :class="variantClass"
    type="button"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, danger, etc.
  }
})

const variantClass = computed(() => `btn-${props.variant}`)
</script>
