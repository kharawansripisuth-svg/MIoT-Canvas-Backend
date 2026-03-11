<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'offline'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const statusConfig = computed(() => {
  switch (props.is_online) {
    case 'online':
      return {
        label: 'Online',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500',
        animate: true
      }
    case 'idle':
      return {
        label: 'Idle',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        dotColor: 'bg-yellow-500',
        animate: false
      }
    default:
      return {
        label: 'Offline',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        dotColor: 'bg-gray-400',
        animate: false
      }
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-2 py-0.5 text-xs'
    case 'lg': return 'px-3 py-1.5 text-sm'
    default: return 'px-2.5 py-1 text-xs'
  }
})

const dotSize = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-1.5 h-1.5'
    case 'lg': return 'w-2.5 h-2.5'
    default: return 'w-2 h-2'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      statusConfig.bgColor,
      statusConfig.textColor,
      sizeClasses
    ]"
  >
    <span
      :class="[
        'rounded-full',
        statusConfig.dotColor,
        dotSize,
        { 'animate-pulse': statusConfig.animate }
      ]"
    ></span>
    {{ statusConfig.label }}
  </span>
</template>
