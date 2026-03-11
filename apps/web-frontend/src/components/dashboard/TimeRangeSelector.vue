<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '1h'
  },
  showCustom: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'custom-range'])

const presets = [
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' }
]

const showCustomModal = ref(false)
const customFrom = ref('')
const customTo = ref('')

const isCustom = computed(() => props.modelValue === 'custom')

const selectPreset = (value) => {
  emit('update:modelValue', value)
}

const openCustomModal = () => {
  const now = new Date()
  customTo.value = now.toISOString().slice(0, 16)
  customFrom.value = new Date(now.getTime() - 3600000).toISOString().slice(0, 16)
  showCustomModal.value = true
}

const applyCustomRange = () => {
  if (customFrom.value && customTo.value) {
    emit('custom-range', {
      from: new Date(customFrom.value).toISOString(),
      to: new Date(customTo.value).toISOString()
    })
    emit('update:modelValue', 'custom')
  }
  showCustomModal.value = false
}

const cancelCustom = () => {
  showCustomModal.value = false
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-500">Time Range:</span>

    <div class="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        v-for="preset in presets"
        :key="preset.value"
        @click="selectPreset(preset.value)"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
          modelValue === preset.value
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        {{ preset.label }}
      </button>

      <button
        v-if="showCustom"
        @click="openCustomModal"
        :class="[
          'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
          isCustom
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        ]"
      >
        Custom
      </button>
    </div>

    <!-- Custom Range Modal -->
    <div
      v-if="showCustomModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="cancelCustom"
    >
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Custom Time Range</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              v-model="customFrom"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              v-model="customTo"
              type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelCustom"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            @click="applyCustomRange"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
