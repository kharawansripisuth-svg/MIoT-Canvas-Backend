<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const imageError = ref(false)

const fitClasses = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none'
}

const fitClass = computed(() => fitClasses[props.config.fit] || 'object-cover')

const handleError = () => {
  imageError.value = true
}

const handleLoad = () => {
  imageError.value = false
}
</script>

<template>
  <div class="h-full min-h-[150px] flex items-center justify-center">
    <!-- No URL configured -->
    <div v-if="!config.url" class="text-center text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-sm">No image URL configured</p>
    </div>

    <!-- Image error -->
    <div v-else-if="imageError" class="text-center text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-sm">Failed to load image</p>
    </div>

    <!-- Image display -->
    <img
      v-else
      :src="config.url"
      :alt="config.altText || 'Widget image'"
      :class="['w-full h-full max-h-[300px] rounded-lg', fitClass]"
      @error="handleError"
      @load="handleLoad"
    />
  </div>
</template>
