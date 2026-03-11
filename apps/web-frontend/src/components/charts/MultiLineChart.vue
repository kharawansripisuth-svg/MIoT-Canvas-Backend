<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  series: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '350px'
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  smooth: {
    type: Boolean,
    default: true
  }
})

const chartRef = ref(null)
let chart = null

const colors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

const option = computed(() => ({
  title: {
    text: props.title,
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#374151'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      if (!params.length) return ''
      const time = new Date(params[0].data[0]).toLocaleString()
      let result = `${time}<br/>`
      params.forEach(param => {
        const value = param.data[1]
        result += `${param.marker} ${param.seriesName}: <b>${value?.toFixed(2) || '-'}</b><br/>`
      })
      return result
    }
  },
  legend: {
    show: props.showLegend,
    bottom: 0,
    data: props.series.map(s => s.name)
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: props.showLegend ? '15%' : '3%',
    top: props.title ? '15%' : '8%',
    containLabel: true
  },
  xAxis: {
    type: 'time',
    axisLabel: {
      formatter: (value) => {
        const date = new Date(value)
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      },
      color: '#6b7280'
    },
    axisLine: {
      lineStyle: { color: '#e5e7eb' }
    },
    splitLine: {
      show: true,
      lineStyle: { color: '#f3f4f6' }
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#6b7280'
    },
    axisLine: {
      show: false
    },
    splitLine: {
      lineStyle: { color: '#f3f4f6' }
    }
  },
  series: props.series.map((s, index) => ({
    name: s.name,
    type: 'line',
    smooth: props.smooth,
    symbol: 'none',
    data: s.data.map(item => [
      new Date(item.time).getTime(),
      item.value
    ]),
    lineStyle: {
      color: s.color || colors[index % colors.length],
      width: 2
    }
  })),
  dataZoom: [{
    type: 'inside',
    start: 0,
    end: 100
  }]
}))

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

watch(() => props.series, updateChart, { deep: true })
watch(() => [props.title, props.showLegend], updateChart)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" :style="{ width: '100%', height }"></div>
</template>
