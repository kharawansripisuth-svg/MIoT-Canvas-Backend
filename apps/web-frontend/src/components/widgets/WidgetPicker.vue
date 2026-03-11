<script setup>
import { ref, computed } from 'vue'
import { useWidgetStore, WIDGET_TYPES } from '@/stores/widgetStore'

const widgetStore = useWidgetStore()

const selectedCategory = ref('all')

const categories = [
  { id: 'all', label: 'All Widgets', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'data', label: 'Data & Charts', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'content', label: 'Content', icon: 'M4 6h16M4 12h16m-7 6h7' },
  { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }
]

const widgetTypes = [
  {
    type: WIDGET_TYPES.CHART,
    name: 'Chart',
    description: 'Visualize time-series data with various chart types',
    longDescription: 'Display temperature, humidity, and other metrics over time. Supports line, area, bar, scatter, and pie charts.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    category: 'data',
    color: 'indigo',
    popular: true
  },
  {
    type: WIDGET_TYPES.GAUGE,
    name: 'Gauge',
    description: 'Display real-time values with color thresholds',
    longDescription: 'Perfect for showing current temperature, humidity, or any metric with warning and danger levels.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    category: 'data',
    color: 'amber',
    popular: true
  },
  {
    type: WIDGET_TYPES.TEXT,
    name: 'Text',
    description: 'Add notes, instructions, or formatted text',
    longDescription: 'Supports Markdown formatting including headers, bold, italic, lists, and links.',
    icon: 'M4 6h16M4 12h16m-7 6h7',
    category: 'content',
    color: 'emerald'
  },
  {
    type: WIDGET_TYPES.IMAGE,
    name: 'Image',
    description: 'Display images, diagrams, or floor plans',
    longDescription: 'Show static images from any URL. Great for facility maps or device photos.',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    category: 'content',
    color: 'pink'
  },
  {
    type: WIDGET_TYPES.MAP,
    name: 'Map',
    description: 'Show device locations on an interactive map',
    longDescription: 'Display geographic locations using OpenStreetMap. Supports zoom and custom markers.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    category: 'location',
    color: 'cyan'
  }
]

const colorClasses = {
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:border-indigo-400', gradient: 'from-indigo-500 to-purple-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:border-amber-400', gradient: 'from-amber-500 to-orange-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', hover: 'hover:border-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:border-pink-400', gradient: 'from-pink-500 to-rose-500' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200', hover: 'hover:border-cyan-400', gradient: 'from-cyan-500 to-blue-500' }
}

const filteredWidgets = computed(() => {
  if (selectedCategory.value === 'all') return widgetTypes
  return widgetTypes.filter(w => w.category === selectedCategory.value)
})

const handleSelect = (type) => {
  widgetStore.addWidget(type)
}

const handleClose = () => {
  widgetStore.closeWidgetPicker()
}
</script>

<template>
  <div
    v-if="widgetStore.showWidgetPicker"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col fixed bottom-0 sm:relative sm:bottom-auto">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div class="flex items-center justify-between">
          <div class="text-white">
            <h2 class="text-xl font-bold">Add Widget</h2>
            <p class="text-white/80 text-sm mt-0.5">Choose a widget to add to your dashboard</p>
          </div>
          <button
            @click="handleClose"
            class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div class="flex gap-2 overflow-x-auto">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectedCategory = cat.id"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
              selectedCategory === cat.id
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon" />
            </svg>
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Widget Grid -->
      <div class="p-6 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            v-for="widget in filteredWidgets"
            :key="widget.type"
            @click="handleSelect(widget.type)"
            :class="[
              'p-5 bg-white border-2 rounded-2xl text-left group transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
              colorClasses[widget.color].border,
              colorClasses[widget.color].hover
            ]"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div :class="[
                'w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110',
                colorClasses[widget.color].bg
              ]">
                <svg :class="['w-7 h-7', colorClasses[widget.color].text]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="widget.icon" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {{ widget.name }}
                  </h3>
                  <span v-if="widget.popular" class="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    Popular
                  </span>
                </div>
                <p class="text-gray-500 text-sm mt-1">{{ widget.description }}</p>
                <p class="text-gray-400 text-xs mt-2 group-hover:text-gray-500 transition-colors">
                  {{ widget.longDescription }}
                </p>
              </div>

              <!-- Arrow -->
              <div class="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="filteredWidgets.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500 font-medium">No widgets in this category</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          <span class="font-medium">{{ filteredWidgets.length }}</span> widgets available
        </p>
        <button
          @click="handleClose"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
