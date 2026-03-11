<script setup>
import { computed } from 'vue'
import { useRealtimeStore } from '@/stores/realtimeStore'
import DeviceStatusBadge from '@/components/devices/DeviceStatusBadge.vue'

const props = defineProps({
  deviceName: {
    type: String,
    default: null
  },
  deviceNumber: {
    type: String,
    default: null
  },
  maxItems: {
    type: Number,
    default: 10
  }
})

const realtimeStore = useRealtimeStore()

const latestData = computed(() => {
  if (props.deviceName && props.deviceNumber) {
    const data = realtimeStore.getLatestForDevice(props.deviceName, props.deviceNumber)
    return data ? [data] : []
  }
  return Object.values(realtimeStore.allLatestData).slice(0, props.maxItems)
})

const formatValue = (value) => {
  if (typeof value === 'number') return value.toFixed(2)
  if (value === null || value === undefined) return '-'
  return value
}

const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleTimeString()
}

const getFieldColor = (field) => {
  const colors = {
    temperature: 'text-red-500',
    humidity: 'text-blue-500',
    co2: 'text-green-500',
    pm25: 'text-purple-500',
    energy: 'text-yellow-500',
    voltage: 'text-orange-500',
    current: 'text-cyan-500'
  }
  return colors[field.toLowerCase()] || 'text-gray-600'
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            :class="[
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              realtimeStore.isConnected ? 'bg-green-400' : 'bg-gray-400'
            ]"
          ></span>
          <span
            :class="[
              'relative inline-flex rounded-full h-2 w-2',
              realtimeStore.isConnected ? 'bg-green-500' : 'bg-gray-400'
            ]"
          ></span>
        </span>
        <h3 class="font-medium text-gray-900">Real-time Data</h3>
      </div>

      <span class="text-xs text-gray-500">
        {{ realtimeStore.isConnected ? 'Connected' : 'Disconnected' }}
      </span>
    </div>

    <!-- Content -->
    <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
      <div
        v-for="(item, index) in latestData"
        :key="index"
        class="px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <!-- Device info -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-900">
              {{ item.device?.device_name || 'Unknown' }}_{{ item.device?.device_number || '?' }}
            </span>
            <DeviceStatusBadge status="online" size="sm" />
          </div>
          <span class="text-xs text-gray-400">{{ formatTime(item.timestamp) }}</span>
        </div>

        <!-- Values grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          <template v-for="(value, key) in item" :key="key">
            <div
              v-if="!['device', 'timestamp', 'topic'].includes(key) && typeof value === 'number'"
              class="flex items-center gap-1"
            >
              <span :class="['font-medium', getFieldColor(key)]">{{ key }}:</span>
              <span class="text-gray-700">{{ formatValue(value) }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="latestData.length === 0" class="px-4 py-8 text-center">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p class="text-gray-500">Waiting for data...</p>
        <p class="text-sm text-gray-400 mt-1">
          {{ realtimeStore.isConnected ? 'Connected to server' : 'Connecting...' }}
        </p>
      </div>
    </div>

    <!-- Footer with last update -->
    <div v-if="realtimeStore.lastUpdate" class="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <p class="text-xs text-gray-500">
        Last update: {{ new Date(realtimeStore.lastUpdate).toLocaleString() }}
      </p>
    </div>
  </div>
</template>
