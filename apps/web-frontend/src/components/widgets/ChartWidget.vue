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
const chartData = ref([])
const loading = ref(false)
const error = ref(null)

// Color palette for beautiful charts
const colorPalette = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6'
]

// Fetch data from InfluxDB
const fetchData = async () => {
  if (!props.config.measurement) {
    chartData.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await influxService.queryData({
      measurement: props.config.measurement,
      fields: props.config.yFields || ['*'],
      tags: props.config.tagFilter ? { [props.config.tagKey]: props.config.tagFilter } : {},
      timeRange: props.config.timeRange || '1h',
      aggregation: props.config.aggregation || null,
      groupBy: props.config.groupBy || null,
      limit: props.config.limit || 500,
      orderDesc: false
    })

    chartData.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch chart data:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Build ECharts option based on chart type
const option = computed(() => {
  const chartType = props.config.chartType || 'line'
  const xField = props.config.xField || 'time'
  const yFields = props.config.yFields || []

  if (chartData.value.length === 0 || yFields.length === 0) {
    return getEmptyOption()
  }

  switch (chartType) {
    case 'line':
    case 'area':
      return getLineAreaOption(chartType === 'area')
    case 'bar':
      return getBarOption()
    case 'scatter':
      return getScatterOption()
    case 'pie':
      return getPieOption()
    default:
      return getLineAreaOption(false)
  }
})

const getEmptyOption = () => ({
  title: {
    text: 'No Data',
    left: 'center',
    top: 'center',
    textStyle: {
      color: '#9ca3af',
      fontSize: 14
    }
  }
})

const getLineAreaOption = (showArea) => {
  const xField = props.config.xField || 'time'
  const yFields = props.config.yFields || []

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params) => {
        let result = `<div style="font-weight: 600; margin-bottom: 8px;">${formatXValue(params[0]?.axisValue)}</div>`
        params.forEach(p => {
          result += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${p.color};"></span>
            <span>${p.seriesName}:</span>
            <span style="font-weight: 600;">${p.value?.[1]?.toFixed(2) ?? '-'}</span>
          </div>`
        })
        return result
      }
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#6b7280' },
      icon: 'roundRect'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: yFields.length > 1 ? '15%' : '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: xField === 'time' ? 'time' : 'category',
      data: xField !== 'time' ? chartData.value.map(d => d[xField]) : undefined,
      axisLabel: {
        color: '#6b7280',
        formatter: xField === 'time' ? formatTimeLabel : undefined
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: yFields.map((field, index) => ({
      name: field,
      type: 'line',
      smooth: props.config.smooth !== false,
      symbol: 'none',
      sampling: 'lttb',
      data: chartData.value.map(d => [
        xField === 'time' ? new Date(d.time).getTime() : d[xField],
        d[field]
      ]).filter(d => d[1] !== null && d[1] !== undefined),
      lineStyle: {
        color: colorPalette[index % colorPalette.length],
        width: 2.5
      },
      areaStyle: showArea ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${colorPalette[index % colorPalette.length]}50` },
          { offset: 1, color: `${colorPalette[index % colorPalette.length]}05` }
        ])
      } : undefined,
      emphasis: {
        focus: 'series',
        lineStyle: { width: 3 }
      }
    })),
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 100
    }],
    animationDuration: 500,
    animationEasing: 'cubicOut'
  }
}

const getBarOption = () => {
  const xField = props.config.xField || 'time'
  const yFields = props.config.yFields || []

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' }
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#6b7280' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: yFields.length > 1 ? '15%' : '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.slice(-20).map(d => formatXValue(d[xField])),
      axisLabel: { color: '#6b7280', rotate: 45 },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: yFields.map((field, index) => ({
      name: field,
      type: 'bar',
      data: chartData.value.slice(-20).map(d => d[field]),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorPalette[index % colorPalette.length] },
          { offset: 1, color: `${colorPalette[index % colorPalette.length]}80` }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorPalette[index % colorPalette.length] },
            { offset: 1, color: colorPalette[index % colorPalette.length] }
          ])
        }
      }
    })),
    animationDuration: 500
  }
}

const getScatterOption = () => {
  const xField = props.config.xField || (props.config.yFields?.[0] || 'time')
  const yField = props.config.yFields?.[1] || props.config.yFields?.[0] || ''

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      formatter: (p) => `${xField}: ${p.value[0]?.toFixed(2)}<br/>${yField}: ${p.value[1]?.toFixed(2)}`
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: xField,
      nameLocation: 'center',
      nameGap: 30,
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: yField,
      nameLocation: 'center',
      nameGap: 40,
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [{
      type: 'scatter',
      data: chartData.value.map(d => [d[xField], d[yField]]).filter(d => d[0] != null && d[1] != null),
      symbolSize: 8,
      itemStyle: {
        color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
          { offset: 0, color: colorPalette[0] },
          { offset: 1, color: `${colorPalette[0]}80` }
        ])
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(99, 102, 241, 0.5)'
        }
      }
    }],
    animationDuration: 500
  }
}

const getPieOption = () => {
  const yField = props.config.yFields?.[0] || ''
  const labelField = props.config.xField || props.config.tagKey || 'name'

  // Aggregate data for pie chart
  const aggregated = {}
  chartData.value.forEach(d => {
    const label = d[labelField] || 'Unknown'
    if (!aggregated[label]) aggregated[label] = 0
    if (d[yField] != null) aggregated[label] += d[yField]
  })

  const pieData = Object.entries(aggregated)
    .map(([name, value], index) => ({
      name,
      value,
      itemStyle: { color: colorPalette[index % colorPalette.length] }
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#6b7280' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      data: pieData
    }],
    animationDuration: 500,
    animationType: 'scale'
  }
}

// Helper functions
const formatXValue = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const formatTimeLabel = (value) => {
  const date = new Date(value)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

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

watch(() => props.config, () => {
  fetchData()
}, { deep: true })

watch(chartData, updateChart)
watch(option, updateChart)

onMounted(() => {
  initChart()
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div class="h-full min-h-[200px] relative">
    <!-- Loading overlay -->
    <div v-if="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
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
    <div v-if="!config.measurement" class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p class="text-sm font-medium">Configure Chart</p>
        <p class="text-xs mt-1">Select measurement and fields</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else ref="chartRef" class="w-full h-full min-h-[200px]"></div>
  </div>
</template>
