<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const mapCenter = computed(() => {
  return {
    lat: props.config.lat || 13.7563,
    lng: props.config.lng || 100.5018
  }
})

// Generate OpenStreetMap embed URL
const mapUrl = computed(() => {
  const { lat, lng } = mapCenter.value
  const zoom = props.config.zoom || 13
  const delta = 0.02 / zoom

  // Using OpenStreetMap
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
})
</script>

<template>
  <div class="h-full min-h-[200px] relative">
    <!-- No coordinates -->
    <div v-if="!config.lat && !config.lng" class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-sm font-medium">Configure Map</p>
        <p class="text-xs mt-1">Set latitude and longitude</p>
      </div>
    </div>

    <!-- Map iframe -->
    <div v-else class="h-full w-full">
      <iframe
        :src="mapUrl"
        class="w-full h-full min-h-[200px] rounded-lg border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Location Map"
      ></iframe>

      <!-- Coordinates overlay -->
      <div class="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-xs px-2 py-1 rounded shadow">
        {{ mapCenter.lat.toFixed(4) }}, {{ mapCenter.lng.toFixed(4) }}
      </div>
    </div>
  </div>
</template>
