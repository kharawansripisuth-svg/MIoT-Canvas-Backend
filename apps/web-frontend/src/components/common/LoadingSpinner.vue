<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'blue'
  },
  label: {
    type: String,
    default: ''
  }
})

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const colorClasses = {
  blue: 'text-blue-500',
  gray: 'text-gray-500',
  white: 'text-white',
  green: 'text-green-500'
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <svg
      :class="[sizeClasses[size], colorClasses[color], 'animate-spin']"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <p v-if="label" class="text-sm text-gray-500">{{ label }}</p>
  </div>
</template>
