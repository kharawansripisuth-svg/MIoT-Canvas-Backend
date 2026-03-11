<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'An error occurred'
  },
  title: {
    type: String,
    default: 'Error'
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info'].includes(value)
  }
})

const emit = defineEmits(['dismiss', 'retry'])

const variantClasses = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    text: 'text-red-700'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    text: 'text-yellow-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    text: 'text-blue-700'
  }
}

const iconPaths = {
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}
</script>

<template>
  <div
    :class="[
      'rounded-lg border p-4',
      variantClasses[variant].bg,
      variantClasses[variant].border
    ]"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <svg
          :class="['h-5 w-5', variantClasses[variant].icon]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="iconPaths[variant]"
          />
        </svg>
      </div>

      <div class="ml-3 flex-1">
        <h3 :class="['text-sm font-medium', variantClasses[variant].title]">
          {{ title }}
        </h3>
        <p :class="['mt-1 text-sm', variantClasses[variant].text]">
          {{ message }}
        </p>

        <div class="mt-3 flex gap-3">
          <button
            @click="emit('retry')"
            class="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Try again
          </button>
        </div>
      </div>

      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          @click="emit('dismiss')"
          :class="[
            'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
            variantClasses[variant].icon
          ]"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
