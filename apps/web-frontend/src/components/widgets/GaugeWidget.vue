<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import influxService from '@/services/influxService'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chart = null
const currentValue = ref(0)
const loading = ref(false)
const error = ref(null)
let refreshInterval = null

// Fetch latest value from InfluxDB
const fetchData = async () => {
  if (!props.config.measurement || !props.config.field) {
    currentValue.value = 0
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await influxService.queryData({
      measurement: props.config.measurement,
      fields: [props.config.field],
      tags: props.config.tagFilter ? { [props.config.tagKey]: props.config.tagFilter } : {},
      timeRange: '5m',
      limit: 1,
      orderDesc: true
    })

    if (response.data && response.data.length > 0) {
      const val = response.data[0][props.config.field]
      currentValue.value = typeof val === 'number' ? val : 0
    }
  } catch (err) {
    console.error('Failed to fetch gauge data:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Determine color based on thresholds
const gaugeColor = computed(() => {
  const value = currentValue.value
  const thresholds = props.config.thresholds || {}

  if (thresholds.danger && value >= thresholds.danger) {
    return props.config.colorDanger || '#ef4444'
  }
  if (thresholds.warning && value >= thresholds.warning) {
    return props.config.colorWarning || '#f59e0b'
  }
  return props.config.colorNormal || '#22c55e'
})

const option = computed(() => {
  const min = props.config.min ?? 0
  const max = props.config.max ?? 100
  const thresholds = props.config.thresholds || { warning: 70, danger: 90 }

  // Calculate color stops for the gauge arc
  const warningRatio = (thresholds.warning - min) / (max - min)
  const dangerRatio = (thresholds.danger - min) / (max - min)

  return {
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: min,
      max: max,
      radius: '90%',
      center: ['50%', '55%'],
      splitNumber: 5,
      progress: {
        show: true,
        roundCap: true,
        width: 12,
        itemStyle: {
          color: gaugeColor.value
        }
      },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 12,
          color: [
            [warningRatio, props.config.colorNormal || '#22c55e'],
            [dangerRatio, props.config.colorWarning || '#f59e0b'],
            [1, props.config.colorDanger || '#ef4444']
          ]
        }
      },
      pointer: {
        length: '55%',
        width: 6,
        offsetCenter: [0, 0],
        itemStyle: {
          color: gaugeColor.value,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      axisTick: {
        distance: -20,
        length: 6,
        splitNumber: 2,
        lineStyle: {
          color: '#d1d5db',
          width: 1
        }
      },
      splitLine: {
        distance: -24,
        length: 10,
        lineStyle: {
          color: '#9ca3af',
          width: 2
        }
      },
      axisLabel: {
        distance: -32,
        color: '#6b7280',
        fontSize: 10,
        fontWeight: 500
      },
      title: {
        show: false
      },
      anchor: {
        show: true,
        size: 16,
        itemStyle: {
          color: gaugeColor.value,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        offsetCenter: [0, '40%'],
        formatter: (value) => `${value.toFixed(1)}${props.config.unit || ''}`,
        color: gaugeColor.value
      },
      data: [{
        value: currentValue.value,
        name: props.config.field || 'Value'
      }],
      animationDuration: 800,
      animationEasing: 'cubicOut'
    }]
  }
})

function initChart() {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption(option.value)
  }
}

function updateChart() {
  if (chart) {
    chart.setOption(option.value, true)
  }
}

function handleResize() {
  chart?.resize()
}

// Watch for config changes
watch(() => props.config, () => {
  fetchData()
}, { deep: true })

watch(currentValue, updateChart)
watch(option, updateChart)

onMounted(() => {
  initChart()
  fetchData()
  // Refresh every 10 seconds
  refreshInterval = setInterval(fetchData, 10000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div class="h-full min-h-[180px] relative">
    <!-- Loading overlay -->
    <div v-if="loading && !currentValue" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
      <div class="flex items-center gap-2 text-gray-500">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- No config state -->
    <div v-if="!config.measurement || !config.field" class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p class="text-sm font-medium">Configure Gauge</p>
        <p class="text-xs mt-1">Select measurement and field</p>
      </div>
    </div>

    <!-- Gauge Chart -->
    <div v-else ref="chartRef" class="w-full h-full min-h-[180px]"></div>
  </div>
</template>
