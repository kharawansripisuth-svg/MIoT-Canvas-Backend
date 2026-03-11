<script setup>
import { computed, ref } from 'vue'
import { useWidgetStore } from '@/stores/widgetStore'

const props = defineProps({
  widget: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'duplicate', 'remove'])

const widgetStore = useWidgetStore()

const isSelected = computed(() => widgetStore.selectedWidgetId === props.widget.id)
const isDragging = ref(false)

const handleClick = () => {
  if (widgetStore.isEditMode) {
    widgetStore.selectWidget(props.widget.id)
  }
}

const handleEdit = () => {
  widgetStore.editWidget(props.widget.id)
}

const handleDuplicate = () => {
  widgetStore.duplicateWidget(props.widget.id)
}

const handleRemove = () => {
  if (confirm('Are you sure you want to remove this widget?')) {
    widgetStore.removeWidget(props.widget.id)
  }
}

// Drag handling
const dragStartPos = ref({ x: 0, y: 0 })
const originalPos = ref({ x: 0, y: 0 })

const handleDragStart = (e) => {
  if (!widgetStore.isEditMode) return

  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }
  originalPos.value = { x: props.widget.x, y: props.widget.y }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

const handleDragMove = (e) => {
  if (!isDragging.value) return

  const dx = e.clientX - dragStartPos.value.x
  const dy = e.clientY - dragStartPos.value.y

  // Convert to grid units (approximate)
  const gridUnitX = Math.round(dx / 100)
  const gridUnitY = Math.round(dy / 80)

  widgetStore.updateWidgetPosition(
    props.widget.id,
    originalPos.value.x + gridUnitX,
    originalPos.value.y + gridUnitY
  )
}

const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  widgetStore.saveLayout()
}

// Format last update time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
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
    :class="[
      'relative bg-white rounded-xl border overflow-hidden transition-all duration-200',
      widgetStore.isEditMode ? 'cursor-move' : '',
      isSelected && widgetStore.isEditMode ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
      isDragging ? 'opacity-70 shadow-2xl scale-[1.02]' : 'hover:shadow-md'
    ]"
    @click="handleClick"
    @mousedown="handleDragStart"
  >
    <!-- Edit Mode Controls -->
    <div
      v-if="widgetStore.isEditMode"
      class="absolute top-2 right-2 z-20 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-gray-200 p-1"
    >
      <button
        @click.stop="handleEdit"
        class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Edit"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        @click.stop="handleDuplicate"
        class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
        title="Duplicate"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      <button
        @click.stop="handleRemove"
        class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Remove"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Widget Header -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 min-w-0">
        <h3 class="font-medium text-gray-900 truncate">{{ widget.title }}</h3>
      </div>
      <span v-if="widget.lastUpdate" class="text-xs text-gray-400 whitespace-nowrap">
        {{ formatTime(widget.lastUpdate) }}
      </span>
    </div>

    <!-- Widget Content -->
    <div class="p-4">
      <slot></slot>
    </div>

    <!-- Resize Handle (Edit Mode) -->
    <div
      v-if="widgetStore.isEditMode"
      class="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
      @mousedown.stop
    >
      <svg class="w-4 h-4 text-gray-400 absolute bottom-1 right-1" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
      </svg>
    </div>
  </div>
</template>
