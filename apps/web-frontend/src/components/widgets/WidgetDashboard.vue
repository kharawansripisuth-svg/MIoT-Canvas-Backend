<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWidgetStore, WIDGET_TYPES } from '@/stores/widgetStore'

import WidgetPicker from './WidgetPicker.vue'
import WidgetEditor from './WidgetEditor.vue'
import ChartWidget from './ChartWidget.vue'
import GaugeWidget from './GaugeWidget.vue'
import TextWidget from './TextWidget.vue'
import ImageWidget from './ImageWidget.vue'
import MapWidget from './MapWidget.vue'

const widgetStore = useWidgetStore()
const isConnected = ref(true)

// Responsive breakpoints
const windowWidth = ref(window.innerWidth)
const currentBreakpoint = computed(() => {
  if (windowWidth.value < 640) return 'phone'
  if (windowWidth.value < 1024) return 'tablet'
  return 'pc'
})

// Responsive grid configuration
const gridConfig = computed(() => {
  switch (currentBreakpoint.value) {
    case 'phone':
      return { columns: 4, rowHeight: 70, gap: 12 }
    case 'tablet':
      return { columns: 8, rowHeight: 75, gap: 14 }
    default:
      return { columns: 12, rowHeight: 80, gap: 16 }
  }
})

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// Drag state
const dragState = ref({
  isDragging: false,
  widgetId: null,
  startX: 0,
  startY: 0,
  originalX: 0,
  originalY: 0
})

// Resize state
const resizeState = ref({
  isResizing: false,
  widgetId: null,
  startX: 0,
  startY: 0,
  originalW: 0,
  originalH: 0
})

// Grid container ref
const gridRef = ref(null)

// Calculate responsive widget dimensions
const getResponsiveWidgetDims = (widget) => {
  const cols = gridConfig.value.columns

  switch (currentBreakpoint.value) {
    case 'phone':
      // On phone: all widgets take full width (4 cols)
      return {
        x: 0,
        w: 4,
        h: Math.max(3, Math.ceil(widget.h * 0.75)) // Slightly shorter on mobile
      }
    case 'tablet':
      // On tablet: scale down proportionally (8 cols)
      const tabletW = Math.max(4, Math.ceil(widget.w * 8 / 12))
      const tabletX = Math.min(widget.x * 8 / 12, 8 - tabletW)
      return {
        x: Math.max(0, Math.floor(tabletX)),
        w: Math.min(tabletW, 8),
        h: widget.h
      }
    default:
      // PC: use original dimensions
      return {
        x: widget.x,
        w: widget.w,
        h: widget.h
      }
  }
}

// Calculate widget style based on grid position
const getWidgetStyle = (widget) => {
  const dims = getResponsiveWidgetDims(widget)
  const { rowHeight } = gridConfig.value

  return {
    gridColumn: `${dims.x + 1} / span ${dims.w}`,
    gridRow: `auto / span ${dims.h}`,
    minHeight: `${dims.h * rowHeight}px`
  }
}

// Drag handlers
const startDrag = (e, widget) => {
  if (!widgetStore.isEditMode) return
  e.preventDefault()

  dragState.value = {
    isDragging: true,
    widgetId: widget.id,
    startX: e.clientX,
    startY: e.clientY,
    originalX: widget.x,
    originalY: widget.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

const onDrag = (e) => {
  if (!dragState.value.isDragging) return
  // Disable drag on mobile
  if (currentBreakpoint.value === 'phone') return

  const gridRect = gridRef.value?.getBoundingClientRect()
  if (!gridRect) return

  const columns = gridConfig.value.columns
  const rowHeight = gridConfig.value.rowHeight
  const gap = gridConfig.value.gap
  const cellWidth = (gridRect.width - (columns - 1) * gap) / columns

  const dx = e.clientX - dragState.value.startX
  const dy = e.clientY - dragState.value.startY

  const gridDx = Math.round(dx / (cellWidth + gap))
  const gridDy = Math.round(dy / (rowHeight + gap))

  const widget = widgetStore.widgets.find(w => w.id === dragState.value.widgetId)
  if (widget) {
    const newX = Math.max(0, Math.min(dragState.value.originalX + gridDx, columns - widget.w))
    const newY = Math.max(0, dragState.value.originalY + gridDy)

    widgetStore.updateWidgetPosition(dragState.value.widgetId, newX, newY)
  }
}

const endDrag = () => {
  dragState.value.isDragging = false
  dragState.value.widgetId = null
  widgetStore.saveLayout()

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// Resize handlers
const startResize = (e, widget) => {
  if (!widgetStore.isEditMode) return
  e.preventDefault()
  e.stopPropagation()

  resizeState.value = {
    isResizing: true,
    widgetId: widget.id,
    startX: e.clientX,
    startY: e.clientY,
    originalW: widget.w,
    originalH: widget.h
  }

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', endResize)
}

const onResize = (e) => {
  if (!resizeState.value.isResizing) return
  // Disable resize on mobile
  if (currentBreakpoint.value === 'phone') return

  const gridRect = gridRef.value?.getBoundingClientRect()
  if (!gridRect) return

  const columns = gridConfig.value.columns
  const rowHeight = gridConfig.value.rowHeight
  const gap = gridConfig.value.gap
  const cellWidth = (gridRect.width - (columns - 1) * gap) / columns

  const dx = e.clientX - resizeState.value.startX
  const dy = e.clientY - resizeState.value.startY

  const gridDw = Math.round(dx / (cellWidth + gap))
  const gridDh = Math.round(dy / (rowHeight + gap))

  const newW = Math.max(2, resizeState.value.originalW + gridDw)
  const newH = Math.max(2, resizeState.value.originalH + gridDh)

  widgetStore.updateWidgetSize(resizeState.value.widgetId, newW, newH)
}

const endResize = () => {
  resizeState.value.isResizing = false
  resizeState.value.widgetId = null
  widgetStore.saveLayout()

  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', endResize)
}

// Get component based on widget type
const getWidgetComponent = (type) => {
  const components = {
    [WIDGET_TYPES.CHART]: ChartWidget,
    [WIDGET_TYPES.GAUGE]: GaugeWidget,
    [WIDGET_TYPES.TEXT]: TextWidget,
    [WIDGET_TYPES.IMAGE]: ImageWidget,
    [WIDGET_TYPES.MAP]: MapWidget
  }
  return components[type]
}

// Get widget icon based on type
const getWidgetIcon = (type) => {
  const icons = {
    [WIDGET_TYPES.CHART]: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    [WIDGET_TYPES.GAUGE]: 'M13 10V3L4 14h7v7l9-11h-7z',
    [WIDGET_TYPES.TEXT]: 'M4 6h16M4 12h16m-7 6h7',
    [WIDGET_TYPES.IMAGE]: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    [WIDGET_TYPES.MAP]: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
  }
  return icons[type] || icons[WIDGET_TYPES.TEXT]
}

// Initialize
onMounted(() => {
  widgetStore.loadLayout()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="widget-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-[1800px] mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h1 class="text-base sm:text-xl font-bold text-gray-900">IoT Dashboard</h1>
                <p class="text-xs text-gray-500 hidden sm:block">Real-time monitoring</p>
              </div>
            </div>

            <!-- Connection status -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <span
                :class="[
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                ]"
              ></span>
              <span class="text-sm font-medium" :class="isConnected ? 'text-green-700' : 'text-gray-500'">
                {{ isConnected ? 'Live' : 'Offline' }}
              </span>
            </div>

            <!-- Device indicator -->
            <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
              <svg v-if="currentBreakpoint === 'pc'" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="currentBreakpoint === 'tablet'" class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium text-indigo-700 hidden sm:inline">
                {{ currentBreakpoint === 'pc' ? 'Desktop' : currentBreakpoint === 'tablet' ? 'Tablet' : 'Mobile' }}
              </span>
              <span class="text-xs text-indigo-500 hidden md:inline">({{ gridConfig.columns }} cols)</span>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Edit Mode Toggle -->
            <button
              @click="widgetStore.toggleEditMode"
              :class="[
                'px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base',
                widgetStore.isEditMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
              ]"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="widgetStore.isEditMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="hidden sm:inline">{{ widgetStore.isEditMode ? 'Save Layout' : 'Edit Dashboard' }}</span>
              <span class="sm:hidden">{{ widgetStore.isEditMode ? 'Save' : 'Edit' }}</span>
            </button>

            <!-- Add Widget Button -->
            <button
              v-if="widgetStore.isEditMode"
              @click="widgetStore.openWidgetPicker"
              class="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="hidden sm:inline">Add Widget</span>
              <span class="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mode Banner -->
    <div
      v-if="widgetStore.isEditMode"
      class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
    >
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span class="font-medium text-sm sm:text-base">Edit Mode</span>
          <span class="text-white/80 text-xs sm:text-sm hidden sm:inline">- Drag widgets to move, drag corners to resize</span>
        </div>
        <div class="flex items-center gap-2 text-xs sm:text-sm">
          <span class="px-2 py-1 bg-white/20 rounded-lg">{{ widgetStore.widgets.length }} widgets</span>
        </div>
      </div>
    </div>

    <!-- Mobile Edit Mode Notice -->
    <div
      v-if="widgetStore.isEditMode && currentBreakpoint === 'phone'"
      class="bg-amber-50 border-b border-amber-200 px-4 py-2"
    >
      <p class="text-amber-700 text-xs text-center">
        Switch to a larger screen to drag and resize widgets
      </p>
    </div>

    <!-- Main Content -->
    <div class="max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <!-- Widget Grid -->
      <div
        ref="gridRef"
        :class="[
          'grid transition-all duration-300',
          widgetStore.isEditMode ? 'p-2 sm:p-4 bg-white/50 rounded-xl sm:rounded-2xl border-2 border-dashed border-indigo-300' : ''
        ]"
        :style="{
          gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
          gridAutoRows: `${gridConfig.rowHeight}px`,
          gap: `${gridConfig.gap}px`
        }"
      >
        <div
          v-for="widget in widgetStore.widgetsByPosition"
          :key="widget.id"
          :style="getWidgetStyle(widget)"
          :class="[
            'relative transition-all duration-200',
            dragState.widgetId === widget.id ? 'opacity-70 scale-[1.02] z-50' : '',
            resizeState.widgetId === widget.id ? 'opacity-70 z-50' : '',
            widgetStore.isEditMode && widgetStore.selectedWidgetId === widget.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
          ]"
        >
          <!-- Widget Card -->
          <div
            :class="[
              'h-full bg-white rounded-xl sm:rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300',
              widgetStore.isEditMode && currentBreakpoint !== 'phone' ? 'cursor-move border-gray-300' : 'border-gray-200'
            ]"
            @mousedown="(e) => startDrag(e, widget)"
            @click="widgetStore.isEditMode && widgetStore.selectWidget(widget.id)"
          >
            <!-- Widget Header -->
            <div class="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getWidgetIcon(widget.type)" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-800 truncate text-sm sm:text-base">{{ widget.title }}</h3>
              </div>

              <!-- Edit Controls -->
              <div
                v-if="widgetStore.isEditMode"
                class="flex items-center gap-1"
                @mousedown.stop
              >
                <button
                  @click.stop="widgetStore.editWidget(widget.id)"
                  class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Widget"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  @click.stop="widgetStore.duplicateWidget(widget.id)"
                  class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplicate"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  @click.stop="widgetStore.removeWidget(widget.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Widget Content -->
            <div class="p-2 sm:p-4 h-[calc(100%-44px)] sm:h-[calc(100%-56px)] overflow-hidden">
              <component
                :is="getWidgetComponent(widget.type)"
                :config="widget.config"
              />
            </div>

            <!-- Resize Handle (hidden on mobile) -->
            <div
              v-if="widgetStore.isEditMode && currentBreakpoint !== 'phone'"
              class="absolute bottom-1 right-1 w-6 h-6 cursor-se-resize group"
              @mousedown="(e) => startResize(e, widget)"
            >
              <div class="absolute bottom-0 right-0 w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 24 24" fill="currentColor" class="text-indigo-500">
                  <circle cx="20" cy="20" r="2.5" />
                  <circle cx="12" cy="20" r="2.5" />
                  <circle cx="20" cy="12" r="2.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="widgetStore.widgets.length === 0"
          class="col-span-full py-20 flex flex-col items-center justify-center"
        >
          <div class="text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Welcome to IoT Dashboard</h3>
            <p class="text-gray-500 mb-6 max-w-md">
              Start building your custom dashboard by adding widgets to monitor your IoT devices in real-time.
            </p>
            <button
              @click="widgetStore.loadDefaultWidgets(); widgetStore.saveLayout()"
              class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl mr-3"
            >
              Load Demo Widgets
            </button>
            <button
              v-if="!widgetStore.isEditMode"
              @click="widgetStore.toggleEditMode"
              class="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all"
            >
              Start from Scratch
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <WidgetPicker />
    <WidgetEditor />
  </div>
</template>

<style scoped>
.widget-dashboard {
  min-height: 100vh;
}

/* Smooth transitions when viewport changes */
.widget-dashboard :deep(.grid) {
  transition: grid-template-columns 0.3s ease, gap 0.3s ease;
}

.widget-dashboard :deep(.grid > div) {
  transition: grid-column 0.3s ease, grid-row 0.3s ease, min-height 0.3s ease;
}

/* Touch-friendly on mobile */
@media (max-width: 640px) {
  .widget-dashboard :deep(button) {
    min-height: 44px;
    min-width: 44px;
  }
}
</style>
