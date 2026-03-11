<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: null
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'chart'
  },
  color: {
    type: String,
    default: 'blue'
  },
  trend: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  alert: {
    type: Object,
    default: null
  }
})

const colorClasses = computed(() => {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', icon: 'text-green-500', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-500', border: 'border-yellow-200' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-200' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-500', border: 'border-cyan-200' }
  }
  return colors[props.color] || colors.blue
})

const isAlert = computed(() => {
  if (!props.alert || props.value === null) return false
  if (props.alert.min !== undefined && props.value < props.alert.min) return true
  if (props.alert.max !== undefined && props.value > props.alert.max) return true
  return false
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  if (typeof props.value === 'number') return props.value.toFixed(2)
  return props.value
})

const iconPaths = {
  temperature: 'M12 9a1 1 0 00-1 1v4.5a2.5 2.5 0 101 0V10a1 1 0 00-1-1zm-2.5 10a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1z',
  humidity: 'M12 2.163c.577 1.177 4.5 6.837 4.5 9.837a4.5 4.5 0 11-9 0c0-3 3.923-8.66 4.5-9.837z',
  co2: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
  energy: 'M13 10V3L4 14h7v7l9-11h-7z',
  voltage: 'M13 10V3L4 14h7v7l9-11h-7z',
  current: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  pm25: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
}
</script>

<template>
  <div
    :class="[
      'relative p-4 rounded-xl border transition-all duration-200',
      isAlert ? 'bg-red-50 border-red-300 shadow-red-100' : `${colorClasses.bg} ${colorClasses.border}`,
      'hover:shadow-md'
    ]"
  >
    <!-- Alert indicator -->
    <div v-if="isAlert" class="absolute top-2 right-2">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </div>

    <div class="flex items-start gap-3">
      <!-- Icon -->
      <div :class="['p-2 rounded-lg', colorClasses.bg]">
        <svg
          :class="['w-6 h-6', isAlert ? 'text-red-500' : colorClasses.icon]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="iconPaths[icon] || iconPaths.chart"
          />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-500 truncate">{{ title }}</p>

        <div v-if="loading" class="mt-1">
          <div class="h-7 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div v-else class="mt-1 flex items-baseline gap-1">
          <span :class="['text-2xl font-bold', isAlert ? 'text-red-600' : 'text-gray-900']">
            {{ displayValue }}
          </span>
          <span class="text-sm text-gray-500">{{ unit }}</span>
        </div>

        <!-- Trend indicator -->
        <div v-if="trend" class="mt-1 flex items-center gap-1 text-xs">
          <svg
            v-if="trend.direction === 'up'"
            class="w-3 h-3"
            :class="trend.positive ? 'text-green-500' : 'text-red-500'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <svg
            v-else-if="trend.direction === 'down'"
            class="w-3 h-3"
            :class="trend.positive ? 'text-green-500' : 'text-red-500'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <span :class="trend.positive ? 'text-green-600' : 'text-red-600'">
            {{ trend.value }}%
          </span>
          <span class="text-gray-400">vs last hour</span>
        </div>
      </div>
    </div>
  </div>
</template>
