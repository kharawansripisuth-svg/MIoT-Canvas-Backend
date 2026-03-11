<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  widgets: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Number,
    default: 2
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:widgets', 'widget-click', 'widget-remove', 'widget-resize'])

const draggedWidget = ref(null)
const dragOverIndex = ref(null)

const gridClasses = computed(() => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  return cols[props.columns] || cols[2]
})

const handleDragStart = (index) => {
  if (!props.editable) return
  draggedWidget.value = index
}

const handleDragOver = (e, index) => {
  if (!props.editable) return
  e.preventDefault()
  dragOverIndex.value = index
}

const handleDragEnd = () => {
  if (!props.editable || draggedWidget.value === null || dragOverIndex.value === null) {
    draggedWidget.value = null
    dragOverIndex.value = null
    return
  }

  const widgets = [...props.widgets]
  const [removed] = widgets.splice(draggedWidget.value, 1)
  widgets.splice(dragOverIndex.value, 0, removed)

  emit('update:widgets', widgets)
  draggedWidget.value = null
  dragOverIndex.value = null
}

const handleRemove = (index) => {
  emit('widget-remove', index)
}

const handleClick = (widget, index) => {
  emit('widget-click', { widget, index })
}

const toggleSize = (index) => {
  emit('widget-resize', index)
}
</script>

<template>
  <div :class="['grid gap-4', gridClasses]">
    <div
      v-for="(widget, index) in widgets"
      :key="widget.id || index"
      :class="[
        'relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200',
        widget.size === 'large' ? 'md:col-span-2' : '',
        widget.size === 'full' ? 'md:col-span-full' : '',
        editable ? 'cursor-move' : '',
        dragOverIndex === index ? 'ring-2 ring-blue-400' : '',
        draggedWidget === index ? 'opacity-50' : ''
      ]"
      :draggable="editable"
      @dragstart="handleDragStart(index)"
      @dragover="handleDragOver($event, index)"
      @dragend="handleDragEnd"
      @click="handleClick(widget, index)"
    >
      <!-- Edit controls -->
      <div
        v-if="editable"
        class="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
      >
        <button
          @click.stop="toggleSize(index)"
          class="p-1 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
          title="Toggle size"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          @click.stop="handleRemove(index)"
          class="p-1 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-red-50"
          title="Remove"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Widget header -->
      <div v-if="widget.title" class="px-4 py-3 border-b border-gray-100">
        <h3 class="font-medium text-gray-900">{{ widget.title }}</h3>
        <p v-if="widget.description" class="text-sm text-gray-500 mt-0.5">{{ widget.description }}</p>
      </div>

      <!-- Widget content slot -->
      <div class="p-4">
        <slot :name="`widget-${widget.id || index}`" :widget="widget" :index="index">
          <div class="text-gray-400 text-center py-8">
            Widget content goes here
          </div>
        </slot>
      </div>
    </div>

    <!-- Add widget placeholder -->
    <div
      v-if="editable"
      class="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center py-12 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
    >
      <div class="text-center">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <p class="text-gray-500">Add Widget</p>
      </div>
    </div>
  </div>
</template>
