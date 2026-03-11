import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import measurementService from '@/services/measurementService'

export const useMeasurementStore = defineStore('measurement', () => {
  // State
  const measurements = ref([])
  const availableFields = ref([])
  const selectedFields = ref([])
  const timeRange = ref({
    preset: '1h',
    from: null,
    to: null
  })
  const loading = ref(false)
  const exporting = ref(false)
  const error = ref(null)

  // Time range presets
  const timeRangePresets = {
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  }

  // Getters
  const chartData = computed(() => {
    if (measurements.value.length === 0) return {}

    const result = {}
    selectedFields.value.forEach(field => {
      result[field] = measurements.value
        .filter(m => m[field] !== undefined && m[field] !== null)
        .map(m => ({
          time: new Date(m.time),
          value: m[field]
        }))
        .sort((a, b) => a.time - b.time)
    })
    return result
  })

  const latestValues = computed(() => {
    if (measurements.value.length === 0) return {}

    const latest = measurements.value[0]
    const result = {}
    selectedFields.value.forEach(field => {
      if (latest[field] !== undefined) {
        result[field] = latest[field]
      }
    })
    return result
  })

  const computedTimeRange = computed(() => {
    if (timeRange.value.from && timeRange.value.to) {
      return {
        from: timeRange.value.from,
        to: timeRange.value.to
      }
    }

    const preset = timeRange.value.preset
    const duration = timeRangePresets[preset] || timeRangePresets['1h']
    const now = new Date()
    return {
      from: new Date(now.getTime() - duration).toISOString(),
      to: now.toISOString()
    }
  })

  // Actions
  async function fetchMeasurements(deviceId, options = {}) {
    loading.value = true
    error.value = null

    try {
      const { from, to } = computedTimeRange.value
      const response = await measurementService.queryMeasurements({
        deviceId,
        from,
        to,
        fields: selectedFields.value.length > 0 ? selectedFields.value : undefined,
        limit: options.limit || 1000
      })

      measurements.value = response.data || []

      // Update available fields from response
      if (response.fields && response.fields.length > 0) {
        availableFields.value = response.fields
        // Auto-select all fields if none selected
        if (selectedFields.value.length === 0) {
          selectedFields.value = [...response.fields]
        }
      }

      return measurements.value
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch measurements:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableFields(deviceName, deviceNumber) {
    try {
      const response = await measurementService.getAvailableFields(deviceName, deviceNumber)
      availableFields.value = response.fields || []
      return availableFields.value
    } catch (err) {
      console.error('Failed to fetch available fields:', err)
      return []
    }
  }

  async function exportData(deviceId) {
    exporting.value = true
    error.value = null

    try {
      const { from, to } = computedTimeRange.value
      const blob = await measurementService.exportMeasurements({
        deviceId,
        from,
        to,
        fields: selectedFields.value.length > 0 ? selectedFields.value : undefined
      })

      const filename = `measurements_${deviceId}_${new Date().toISOString().split('T')[0]}.csv`
      measurementService.downloadCSV(blob, filename)
    } catch (err) {
      error.value = err.message
      console.error('Failed to export measurements:', err)
      throw err
    } finally {
      exporting.value = false
    }
  }

  function setTimeRange(preset) {
    timeRange.value = {
      preset,
      from: null,
      to: null
    }
  }

  function setCustomTimeRange(from, to) {
    timeRange.value = {
      preset: 'custom',
      from,
      to
    }
  }

  function setSelectedFields(fields) {
    selectedFields.value = fields
  }

  function toggleField(field) {
    const index = selectedFields.value.indexOf(field)
    if (index === -1) {
      selectedFields.value.push(field)
    } else {
      selectedFields.value.splice(index, 1)
    }
  }

  function clearMeasurements() {
    measurements.value = []
    error.value = null
  }

  return {
    // State
    measurements,
    availableFields,
    selectedFields,
    timeRange,
    loading,
    exporting,
    error,
    // Getters
    chartData,
    latestValues,
    computedTimeRange,
    // Actions
    fetchMeasurements,
    fetchAvailableFields,
    exportData,
    setTimeRange,
    setCustomTimeRange,
    setSelectedFields,
    toggleField,
    clearMeasurements
  }
})
