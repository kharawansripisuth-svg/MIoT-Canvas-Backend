<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWidgetStore, WIDGET_TYPES } from '@/stores/widgetStore'
import influxService from '@/services/influxService'

const widgetStore = useWidgetStore()

const activeTab = ref('basics')
const tabs = [
  { id: 'basics', label: 'Basics', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { id: 'data', label: 'Data Source', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
  { id: 'appearance', label: 'Style', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' }
]

// Human-readable field labels
const fieldLabels = {
  // cu_cisco fields - Environment
  intempmeas: { label: 'Indoor Temperature', unit: '°C', icon: '🌡️', category: 'environment' },
  outtempmeas: { label: 'Outdoor Temperature', unit: '°C', icon: '🌡️', category: 'environment' },
  inhumidmeas: { label: 'Indoor Humidity', unit: '%', icon: '💧', category: 'environment' },
  outhumidmeas: { label: 'Outdoor Humidity', unit: '%', icon: '💧', category: 'environment' },
  // cu_cisco fields - Air Quality
  inco2meas: { label: 'Indoor CO₂', unit: 'ppm', icon: '🫁', category: 'air_quality' },
  outco2meas: { label: 'Outdoor CO₂', unit: 'ppm', icon: '🫁', category: 'air_quality' },
  inpm25meas: { label: 'Indoor PM2.5', unit: 'µg/m³', icon: '🌫️', category: 'air_quality' },
  outpm25meas: { label: 'Outdoor PM2.5', unit: 'µg/m³', icon: '🌫️', category: 'air_quality' },
  intvocmeas: { label: 'Indoor TVOC', unit: 'ppb', icon: '🧪', category: 'air_quality' },
  outtvocmeas: { label: 'Outdoor TVOC', unit: 'ppb', icon: '🧪', category: 'air_quality' },
  // cu_cisco fields - Other
  occcount: { label: 'Occupancy Count', unit: 'people', icon: '👥', category: 'occupancy' },
  cabonemission: { label: 'Carbon Emission', unit: 'kg', icon: '🏭', category: 'energy' },
  totalconsumption: { label: 'Total Consumption', unit: 'kWh', icon: '⚡', category: 'energy' },
  totalconsumptionkw: { label: 'Power Consumption', unit: 'kW', icon: '⚡', category: 'energy' },
  // cu_energymeter fields - Voltage
  voltage_ab: { label: 'Voltage A-B', unit: 'V', icon: '🔌', category: 'voltage' },
  voltage_bc: { label: 'Voltage B-C', unit: 'V', icon: '🔌', category: 'voltage' },
  voltage_ca: { label: 'Voltage C-A', unit: 'V', icon: '🔌', category: 'voltage' },
  voltage_avg: { label: 'Voltage Average', unit: 'V', icon: '🔌', category: 'voltage' },
  un_voltage_ab: { label: 'Unbalanced V A-B', unit: 'V', icon: '🔌', category: 'voltage' },
  un_voltage_bc: { label: 'Unbalanced V B-C', unit: 'V', icon: '🔌', category: 'voltage' },
  un_voltage_ca: { label: 'Unbalanced V C-A', unit: 'V', icon: '🔌', category: 'voltage' },
  un_voltage_ll: { label: 'Unbalanced V L-L', unit: 'V', icon: '🔌', category: 'voltage' },
  // cu_energymeter fields - Current
  current_a: { label: 'Current Phase A', unit: 'A', icon: '⚡', category: 'current' },
  current_b: { label: 'Current Phase B', unit: 'A', icon: '⚡', category: 'current' },
  current_c: { label: 'Current Phase C', unit: 'A', icon: '⚡', category: 'current' },
  current_avg: { label: 'Current Average', unit: 'A', icon: '⚡', category: 'current' },
  // cu_energymeter fields - Power
  active_power: { label: 'Active Power', unit: 'W', icon: '💡', category: 'power' },
  reactive_power: { label: 'Reactive Power', unit: 'VAR', icon: '💡', category: 'power' },
  apparent_power: { label: 'Apparent Power', unit: 'VA', icon: '💡', category: 'power' },
  present_demand: { label: 'Present Demand', unit: 'W', icon: '📊', category: 'power' },
  power_factor: { label: 'Power Factor', unit: '', icon: '📈', category: 'power' },
  frequency: { label: 'Frequency', unit: 'Hz', icon: '〰️', category: 'power' },
  active_energy_delivered: { label: 'Energy Delivered', unit: 'kWh', icon: '🔋', category: 'energy' }
}

const measurementLabels = {
  cu_cisco: { label: 'Building Sensors', description: 'Temperature, humidity, air quality sensors', icon: '🏢' },
  cu_energymeter: { label: 'Energy Meters', description: 'Power and energy consumption data', icon: '⚡' }
}

const fieldCategories = {
  environment: { label: 'Environment', color: 'green', icon: '🌿' },
  air_quality: { label: 'Air Quality', color: 'blue', icon: '🌬️' },
  occupancy: { label: 'Occupancy', color: 'purple', icon: '👥' },
  energy: { label: 'Energy', color: 'yellow', icon: '🔋' },
  voltage: { label: 'Voltage', color: 'cyan', icon: '🔌' },
  current: { label: 'Current', color: 'orange', icon: '⚡' },
  power: { label: 'Power', color: 'red', icon: '💡' }
}

// Get field info with fallback - generate readable label from field name
const getFieldInfo = (fieldName) => {
  if (fieldLabels[fieldName]) {
    return fieldLabels[fieldName]
  }

  // Generate human-readable label from field name
  const label = fieldName
    .replace(/_/g, ' ')
    .replace(/meas$/i, '')
    .replace(/\b\w/g, c => c.toUpperCase())

  return {
    label,
    unit: '',
    icon: '📊',
    category: 'other'
  }
}

// Get measurement info with fallback
const getMeasurementInfo = (measurement) => {
  return measurementLabels[measurement] || {
    label: measurement,
    description: 'Data measurement',
    icon: '📊'
  }
}

// Local copy of widget for editing
const editingWidget = ref(null)

// Data options from InfluxDB
const measurements = ref([])
const availableFields = ref([])
const availableTags = ref([])
const tagValues = ref([])
const loadingData = ref(false)

// Group fields by category
const groupedFields = computed(() => {
  const groups = {}
  availableFields.value.forEach(field => {
    const info = getFieldInfo(field)
    const category = info.category || 'other'
    if (!groups[category]) {
      groups[category] = {
        ...fieldCategories[category] || { label: 'Other', color: 'gray' },
        fields: []
      }
    }
    groups[category].fields.push({ name: field, ...info })
  })
  return groups
})

// Fetch measurements on mount
onMounted(async () => {
  try {
    const response = await influxService.getMeasurements()
    measurements.value = response.measurements || []
  } catch (err) {
    console.error('Failed to fetch measurements:', err)
  }
})

// Initialize editing widget when selected widget changes
watch(
  () => widgetStore.selectedWidget,
  (widget) => {
    if (widget) {
      editingWidget.value = JSON.parse(JSON.stringify(widget))
      if (widget.config.measurement) {
        fetchFieldsAndTags(widget.config.measurement)
      }
    }
  },
  { immediate: true }
)

const fetchFieldsAndTags = async (measurement) => {
  if (!measurement) return
  loadingData.value = true

  try {
    const [fieldsRes, tagsRes] = await Promise.all([
      influxService.getFields(measurement),
      influxService.getTags(measurement)
    ])

    availableFields.value = fieldsRes.fields?.map(f => f.name) || []
    availableTags.value = tagsRes.tags || []

    // Fetch tag values if a tag is selected
    if (editingWidget.value?.config?.tagKey) {
      await fetchTagValues(measurement, editingWidget.value.config.tagKey)
    }
  } catch (err) {
    console.error('Failed to fetch fields/tags:', err)
  } finally {
    loadingData.value = false
  }
}

const fetchTagValues = async (measurement, tag) => {
  try {
    const response = await influxService.getTagValues(measurement, tag)
    tagValues.value = response.values || []
  } catch (err) {
    console.error('Failed to fetch tag values:', err)
  }
}

const handleMeasurementChange = async (measurement) => {
  editingWidget.value.config.measurement = measurement
  editingWidget.value.config.yFields = []
  editingWidget.value.config.xField = 'time'
  editingWidget.value.config.tagKey = ''
  editingWidget.value.config.tagFilter = ''
  await fetchFieldsAndTags(measurement)
}

const handleTagKeyChange = async (tag) => {
  editingWidget.value.config.tagKey = tag
  editingWidget.value.config.tagFilter = ''
  if (tag && editingWidget.value.config.measurement) {
    await fetchTagValues(editingWidget.value.config.measurement, tag)
  }
}

const toggleYField = (field) => {
  const yFields = editingWidget.value.config.yFields || []
  const index = yFields.indexOf(field)
  if (index === -1) {
    yFields.push(field)
  } else {
    yFields.splice(index, 1)
  }
  editingWidget.value.config.yFields = yFields
}

const handleSave = () => {
  if (editingWidget.value) {
    widgetStore.updateWidget(editingWidget.value.id, {
      title: editingWidget.value.title,
      config: editingWidget.value.config
    })
    widgetStore.saveLayout()
    widgetStore.closeEditor()
  }
}

const handleCancel = () => {
  widgetStore.closeEditor()
}

// Options
const chartTypes = [
  { value: 'line', label: 'Line', icon: 'M3 3v18h18M9 17l3-6 3 4 5-8', description: 'Time series trends' },
  { value: 'area', label: 'Area', icon: 'M3 3v18h18M9 17l3-6 3 4 5-8', fill: true, description: 'Filled area chart' },
  { value: 'bar', label: 'Bar', icon: 'M9 19v-6M5 19v-3M13 19v-9M17 19v-12', description: 'Compare values' },
  { value: 'scatter', label: 'Scatter', icon: 'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M6 8m-1.5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0M18 16m-1.5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0M8 16m-1 0a1 1 0 102 0 1 1 0 10-2 0M16 6m-1 0a1 1 0 102 0 1 1 0 10-2 0', description: 'Data distribution' },
  { value: 'pie', label: 'Pie', icon: 'M12 2a10 10 0 0110 10h-10z M12 12V2a10 10 0 100 20 10 10 0 000-20', description: 'Proportions' }
]

const timeRanges = [
  { value: '5m', label: '5 นาที', description: 'Last 5 minutes', group: 'recent' },
  { value: '15m', label: '15 นาที', description: 'Last 15 minutes', group: 'recent' },
  { value: '1h', label: '1 ชม.', description: 'Last hour', group: 'recent' },
  { value: '6h', label: '6 ชม.', description: 'Last 6 hours', group: 'recent' },
  { value: '24h', label: '1 วัน', description: 'Last day', group: 'days' },
  { value: '7d', label: '7 วัน', description: 'Last week', group: 'days' },
  { value: '30d', label: '30 วัน', description: 'Last month', group: 'days' },
  { value: '90d', label: '3 เดือน', description: 'Last 3 months', group: 'months' },
  { value: '180d', label: '6 เดือน', description: 'Last 6 months', group: 'months' },
  { value: '365d', label: '1 ปี', description: 'Last year', group: 'months' }
]

const aggregations = [
  { value: '', label: 'Raw Data', description: 'Show all data points' },
  { value: 'mean', label: 'Average', description: 'Average of values' },
  { value: 'sum', label: 'Sum', description: 'Total sum' },
  { value: 'count', label: 'Count', description: 'Number of points' },
  { value: 'min', label: 'Minimum', description: 'Lowest value' },
  { value: 'max', label: 'Maximum', description: 'Highest value' }
]

const fontSizes = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'X-Large' },
  { value: '2xl', label: '2X-Large' }
]

const alignments = [
  { value: 'left', label: 'Left', icon: 'M4 6h16M4 12h10M4 18h14' },
  { value: 'center', label: 'Center', icon: 'M4 6h16M7 12h10M5 18h14' },
  { value: 'right', label: 'Right', icon: 'M4 6h16M10 12h10M6 18h14' }
]

const imageFits = [
  { value: 'cover', label: 'Cover', description: 'Fill and crop' },
  { value: 'contain', label: 'Contain', description: 'Fit inside' },
  { value: 'fill', label: 'Fill', description: 'Stretch to fit' },
  { value: 'none', label: 'Original', description: 'No scaling' }
]
</script>

<template>
  <div
    v-if="widgetStore.showWidgetEditor && editingWidget"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col fixed bottom-0 sm:relative sm:bottom-auto">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div class="flex items-center justify-between">
          <div class="text-white">
            <h2 class="text-xl font-bold">Widget Settings</h2>
            <p class="text-white/80 text-sm mt-0.5 flex items-center gap-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium">
                {{ editingWidget.type.charAt(0).toUpperCase() + editingWidget.type.slice(1) }}
              </span>
              {{ editingWidget.title }}
            </p>
          </div>
          <button
            @click="handleCancel"
            class="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 px-6 bg-gray-50/80">
        <nav class="flex gap-1 -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-3.5 px-4 font-medium text-sm transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-b-2 border-transparent'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6 overflow-y-auto flex-1 bg-gray-50/30">
        <!-- Basics Tab -->
        <div v-if="activeTab === 'basics'" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Widget Title</label>
            <input
              v-model="editingWidget.title"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-lg"
              placeholder="Enter widget title..."
            />
          </div>

          <!-- Text Widget Content -->
          <div v-if="editingWidget.type === WIDGET_TYPES.TEXT">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Content
              <span class="ml-2 text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Markdown</span>
            </label>
            <textarea
              v-model="editingWidget.config.content"
              rows="10"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm bg-white"
              placeholder="# Heading&#10;**Bold** and *italic*&#10;- List item&#10;[Link](https://example.com)"
            ></textarea>
            <div class="mt-3 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-700">
              <p class="font-medium mb-1">Markdown Tips:</p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <span><code class="bg-white px-1 rounded"># Heading</code> = Heading</span>
                <span><code class="bg-white px-1 rounded">**bold**</code> = <strong>bold</strong></span>
                <span><code class="bg-white px-1 rounded">*italic*</code> = <em>italic</em></span>
                <span><code class="bg-white px-1 rounded">- item</code> = bullet list</span>
              </div>
            </div>
          </div>

          <!-- Image Widget URL -->
          <div v-if="editingWidget.type === WIDGET_TYPES.IMAGE">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <input
              v-model="editingWidget.config.url"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div v-if="editingWidget.config.url" class="mt-4 p-4 bg-gray-100 rounded-xl">
              <p class="text-xs text-gray-500 mb-2">Preview:</p>
              <img :src="editingWidget.config.url" alt="Preview" class="max-h-40 mx-auto rounded-lg shadow" @error="editingWidget.config.url = ''" />
            </div>
          </div>

          <!-- Map Widget Coordinates -->
          <div v-if="editingWidget.type === WIDGET_TYPES.MAP">
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                <input
                  v-model.number="editingWidget.config.lat"
                  type="number"
                  step="any"
                  placeholder="13.7563"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                <input
                  v-model.number="editingWidget.config.lng"
                  type="number"
                  step="any"
                  placeholder="100.5018"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Zoom Level</label>
                <input
                  v-model.number="editingWidget.config.zoom"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="13"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500">Tip: Bangkok coordinates are 13.7563, 100.5018</p>
          </div>
        </div>

        <!-- Data Tab -->
        <div v-if="activeTab === 'data'" class="space-y-6">
          <!-- Chart & Gauge Data Config -->
          <template v-if="[WIDGET_TYPES.CHART, WIDGET_TYPES.GAUGE].includes(editingWidget.type)">

            <!-- Step 1: Measurement Selection -->
            <div class="relative">
              <div class="flex items-center gap-3 mb-3">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold">1</span>
                <label class="text-sm font-semibold text-gray-700">Select Data Source</label>
              </div>
              <div class="grid grid-cols-2 gap-3 ml-10">
                <button
                  v-for="m in measurements"
                  :key="m"
                  @click="handleMeasurementChange(m)"
                  :class="[
                    'p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                    editingWidget.config.measurement === m
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  ]"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-2xl">{{ getMeasurementInfo(m).icon }}</span>
                    <div>
                      <p class="font-semibold text-gray-900">{{ getMeasurementInfo(m).label }}</p>
                      <p class="text-xs text-gray-500 mt-0.5">{{ getMeasurementInfo(m).description }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Filter by Tag (only show if measurement selected) -->
            <div v-if="editingWidget.config.measurement && availableTags.length > 0" class="relative">
              <div class="flex items-center gap-3 mb-3">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
                <label class="text-sm font-semibold text-gray-700">
                  Filter by Device/Tag
                  <span class="ml-2 text-xs font-normal text-gray-500">(optional)</span>
                </label>
              </div>
              <div class="ml-10 space-y-3">
                <!-- Tag Key Selection -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-2">Select Tag Type</label>
                    <select
                      :value="editingWidget.config.tagKey"
                      @change="handleTagKeyChange($event.target.value)"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium"
                    >
                      <option value="">All Devices (No Filter)</option>
                      <option v-for="tag in availableTags" :key="tag" :value="tag">
                        {{ tag }}
                      </option>
                    </select>
                  </div>

                  <!-- Tag Value Selection -->
                  <div v-if="editingWidget.config.tagKey && tagValues.length > 0">
                    <label class="block text-xs font-medium text-gray-500 mb-2">Select Device</label>
                    <select
                      v-model="editingWidget.config.tagFilter"
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium"
                    >
                      <option value="">All {{ editingWidget.config.tagKey }}</option>
                      <option v-for="val in tagValues" :key="val" :value="val">
                        {{ val }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Show selected filter -->
                <div v-if="editingWidget.config.tagFilter" class="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <p class="text-sm text-purple-700 font-medium flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filtered by: <span class="font-normal">{{ editingWidget.config.tagKey }} = {{ editingWidget.config.tagFilter }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="loadingData" class="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-4 rounded-xl ml-10">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span class="font-medium">Loading available fields...</span>
            </div>

            <!-- Step 3: Y-Axis Fields for Chart -->
            <div v-if="editingWidget.type === WIDGET_TYPES.CHART && editingWidget.config.measurement && availableFields.length > 0" class="relative">
              <div class="flex items-center gap-3 mb-3">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold">3</span>
                <label class="text-sm font-semibold text-gray-700">
                  Select Data Fields
                  <span class="ml-2 text-xs font-normal text-gray-500">(click to select multiple)</span>
                </label>
              </div>

              <div class="ml-10 space-y-4">
                <!-- Show fields count -->
                <p class="text-xs text-gray-500">
                  Available: <span class="font-medium text-gray-700">{{ availableFields.length }} fields</span>
                  from {{ getMeasurementInfo(editingWidget.config.measurement).label }}
                </p>

                <div v-for="(group, categoryKey) in groupedFields" :key="categoryKey" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-700">{{ group.label }}</h4>
                    <span class="text-xs text-gray-400">{{ group.fields.length }} fields</span>
                  </div>
                  <div class="p-3 flex flex-wrap gap-2">
                    <button
                      v-for="field in group.fields"
                      :key="field.name"
                      @click="toggleYField(field.name)"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                        (editingWidget.config.yFields || []).includes(field.name)
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                      ]"
                    >
                      <span>{{ field.icon }}</span>
                      <span>{{ field.label }}</span>
                      <span v-if="field.unit" class="text-xs opacity-70">({{ field.unit }})</span>
                    </button>
                  </div>
                </div>

                <!-- Selected fields summary -->
                <div v-if="(editingWidget.config.yFields || []).length > 0" class="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p class="text-sm text-green-700 font-medium">
                    ✓ Selected {{ (editingWidget.config.yFields || []).length }} field(s):
                    <span class="font-normal">
                      {{ (editingWidget.config.yFields || []).map(f => getFieldInfo(f).label).join(', ') }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 3: Gauge-specific - Single Field -->
            <div v-if="editingWidget.type === WIDGET_TYPES.GAUGE && editingWidget.config.measurement && availableFields.length > 0" class="relative">
              <div class="flex items-center gap-3 mb-3">
                <span class="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold">3</span>
                <label class="text-sm font-semibold text-gray-700">Select Metric to Display</label>
              </div>

              <div class="ml-10 space-y-4">
                <!-- Show fields count -->
                <p class="text-xs text-gray-500">
                  Available: <span class="font-medium text-gray-700">{{ availableFields.length }} fields</span>
                  from {{ getMeasurementInfo(editingWidget.config.measurement).label }}
                </p>

                <div v-for="(group, categoryKey) in groupedFields" :key="categoryKey" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h4 class="text-sm font-medium text-gray-700">{{ group.label }}</h4>
                    <span class="text-xs text-gray-400">{{ group.fields.length }} fields</span>
                  </div>
                  <div class="p-3 grid grid-cols-2 gap-2">
                    <button
                      v-for="field in group.fields"
                      :key="field.name"
                      @click="editingWidget.config.field = field.name"
                      :class="[
                        'p-3 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-3',
                        editingWidget.config.field === field.name
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      <span class="text-xl">{{ field.icon }}</span>
                      <div>
                        <p class="font-medium">{{ field.label }}</p>
                        <p v-if="field.unit" class="text-xs opacity-70">Unit: {{ field.unit }}</p>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Selected field summary -->
                <div v-if="editingWidget.config.field" class="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p class="text-sm text-green-700 font-medium">
                    ✓ Selected: <span class="font-normal">{{ getFieldInfo(editingWidget.config.field).label }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Chart Type -->
            <div v-if="editingWidget.type === WIDGET_TYPES.CHART">
              <label class="block text-sm font-semibold text-gray-700 mb-3">Chart Style</label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="ct in chartTypes"
                  :key="ct.value"
                  @click="editingWidget.config.chartType = ct.value"
                  :class="[
                    'p-3 rounded-xl border-2 text-center transition-all hover:shadow-md',
                    editingWidget.config.chartType === ct.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 bg-white'
                  ]"
                >
                  <svg class="w-6 h-6 mx-auto mb-1" :class="editingWidget.config.chartType === ct.value ? 'text-indigo-600' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ct.icon" />
                  </svg>
                  <div class="text-xs font-medium" :class="editingWidget.config.chartType === ct.value ? 'text-indigo-700' : 'text-gray-600'">{{ ct.label }}</div>
                </button>
              </div>
            </div>

            <!-- Time Range -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">Time Range</label>
              <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <!-- Recent -->
                <div>
                  <p class="text-xs font-medium text-gray-500 mb-2">ล่าสุด</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="tr in timeRanges.filter(t => t.group === 'recent')"
                      :key="tr.value"
                      @click="editingWidget.config.timeRange = tr.value"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        editingWidget.config.timeRange === tr.value
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                      ]"
                    >
                      {{ tr.label }}
                    </button>
                  </div>
                </div>
                <!-- Days -->
                <div>
                  <p class="text-xs font-medium text-gray-500 mb-2">รายวัน</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="tr in timeRanges.filter(t => t.group === 'days')"
                      :key="tr.value"
                      @click="editingWidget.config.timeRange = tr.value"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        editingWidget.config.timeRange === tr.value
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                      ]"
                    >
                      {{ tr.label }}
                    </button>
                  </div>
                </div>
                <!-- Months/Historical -->
                <div>
                  <p class="text-xs font-medium text-gray-500 mb-2">ข้อมูลย้อนหลัง</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="tr in timeRanges.filter(t => t.group === 'months')"
                      :key="tr.value"
                      @click="editingWidget.config.timeRange = tr.value"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        editingWidget.config.timeRange === tr.value
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                      ]"
                    >
                      {{ tr.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gauge Thresholds -->
            <div v-if="editingWidget.type === WIDGET_TYPES.GAUGE" class="space-y-4 p-4 bg-white rounded-xl border border-gray-200">
              <h4 class="font-semibold text-gray-700">Gauge Settings</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Min Value</label>
                  <input
                    v-model.number="editingWidget.config.min"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Max Value</label>
                  <input
                    v-model.number="editingWidget.config.max"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                  <input
                    v-model="editingWidget.config.unit"
                    type="text"
                    placeholder="°C, %, etc."
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label class="block text-xs font-medium text-yellow-600 mb-1">⚠️ Warning Threshold</label>
                  <input
                    v-model.number="editingWidget.config.thresholds.warning"
                    type="number"
                    class="w-full px-3 py-2 border-2 border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-yellow-50"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-red-600 mb-1">🚨 Danger Threshold</label>
                  <input
                    v-model.number="editingWidget.config.thresholds.danger"
                    type="number"
                    class="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-red-50"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- No data config needed -->
          <div v-if="[WIDGET_TYPES.TEXT, WIDGET_TYPES.IMAGE, WIDGET_TYPES.MAP].includes(editingWidget.type)" class="text-center py-12 bg-white rounded-xl border border-gray-200">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-500 font-medium">This widget type doesn't need data configuration</p>
            <p class="text-gray-400 text-sm mt-1">Configure content in the Basics tab</p>
          </div>
        </div>

        <!-- Appearance Tab -->
        <div v-if="activeTab === 'appearance'" class="space-y-6">
          <!-- Text Appearance -->
          <template v-if="editingWidget.type === WIDGET_TYPES.TEXT">
            <div class="p-4 bg-white rounded-xl border border-gray-200 space-y-4">
              <h4 class="font-semibold text-gray-700">Text Styling</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Font Size</label>
                  <select
                    v-model="editingWidget.config.fontSize"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option v-for="fs in fontSizes" :key="fs.value" :value="fs.value">{{ fs.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Text Alignment</label>
                  <div class="flex gap-1">
                    <button
                      v-for="a in alignments"
                      :key="a.value"
                      @click="editingWidget.config.alignment = a.value"
                      :class="[
                        'flex-1 py-2 rounded-lg border-2 transition-all',
                        editingWidget.config.alignment === a.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      ]"
                    >
                      <svg class="w-5 h-5 mx-auto" :class="editingWidget.config.alignment === a.value ? 'text-indigo-600' : 'text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="a.icon" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Text Color</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="editingWidget.config.textColor"
                      type="color"
                      class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      v-model="editingWidget.config.textColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Background Color</label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="editingWidget.config.backgroundColor"
                      type="color"
                      class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      v-model="editingWidget.config.backgroundColor"
                      type="text"
                      class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Chart Appearance -->
          <template v-if="editingWidget.type === WIDGET_TYPES.CHART">
            <div class="p-4 bg-white rounded-xl border border-gray-200">
              <h4 class="font-semibold text-gray-700 mb-4">Chart Options</h4>
              <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  v-model="editingWidget.config.smooth"
                  type="checkbox"
                  class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div>
                  <span class="font-medium text-gray-700">Smooth Lines</span>
                  <p class="text-xs text-gray-500">Make line charts curved instead of straight</p>
                </div>
              </label>
            </div>
          </template>

          <!-- Gauge Colors -->
          <template v-if="editingWidget.type === WIDGET_TYPES.GAUGE">
            <div class="p-4 bg-white rounded-xl border border-gray-200">
              <h4 class="font-semibold text-gray-700 mb-4">Gauge Colors</h4>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <label class="block text-xs font-medium text-green-600 mb-2">✓ Normal</label>
                  <input
                    v-model="editingWidget.config.colorNormal"
                    type="color"
                    class="w-full h-12 rounded-xl border-2 border-green-200 cursor-pointer"
                  />
                </div>
                <div class="text-center">
                  <label class="block text-xs font-medium text-yellow-600 mb-2">⚠️ Warning</label>
                  <input
                    v-model="editingWidget.config.colorWarning"
                    type="color"
                    class="w-full h-12 rounded-xl border-2 border-yellow-200 cursor-pointer"
                  />
                </div>
                <div class="text-center">
                  <label class="block text-xs font-medium text-red-600 mb-2">🚨 Danger</label>
                  <input
                    v-model="editingWidget.config.colorDanger"
                    type="color"
                    class="w-full h-12 rounded-xl border-2 border-red-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Image Fit -->
          <template v-if="editingWidget.type === WIDGET_TYPES.IMAGE">
            <div class="p-4 bg-white rounded-xl border border-gray-200">
              <h4 class="font-semibold text-gray-700 mb-4">Image Display</h4>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="f in imageFits"
                  :key="f.value"
                  @click="editingWidget.config.fit = f.value"
                  :class="[
                    'p-3 rounded-lg border-2 text-center transition-all',
                    editingWidget.config.fit === f.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <p class="font-medium text-sm" :class="editingWidget.config.fit === f.value ? 'text-indigo-700' : 'text-gray-700'">{{ f.label }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ f.description }}</p>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
        <button
          @click="handleCancel"
          class="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
