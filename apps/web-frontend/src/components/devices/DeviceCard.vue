<script setup>
import DeviceStatusBadge from './DeviceStatusBadge.vue'

const props = defineProps({
  device: {
    type: Array,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <div
    @click="emit('select', device)"
    :class="[
      'p-4 bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
      selected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
    ]"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 truncate">
          {{ device.device_label || device.device_name }}
        </h3>
        <p class="text-sm text-gray-500 truncate">
          {{ device.device_name }}_{{ device.device_number }}
        </p>
      </div>
      <DeviceStatusBadge :status="device.is_online" />
    </div>

    <div class="space-y-1 text-sm">
      <div v-if="device.device_name" class="flex items-center gap-2 text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        <span>{{ device.device_name }}</span>
      </div>

      <div v-if="device.location" class="flex items-center gap-2 text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="truncate">{{ device.location }}</span>
      </div>

      <div class="flex items-center gap-2 text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ formatLastSeen(device.last_seen) }}</span>
      </div>
    </div>
  </div>
</template>
