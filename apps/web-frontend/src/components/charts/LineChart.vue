<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: ''
  },
  xField: {
    type: String,
    default: 'time'
  },
  yField: {
    type: String,
    default: 'value'
  },
  unit: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  height: {
    type: String,
    default: '300px'
  },
  showArea: {
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

const chartData = computed(() => {
  return props.data.map(item => [
    new Date(item[props.xField]).getTime(),
    item[props.yField]
  ])
})

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
      const point = params[0]
      const date = new Date(point.data[0])
      const value = point.data[1]
      return `${date.toLocaleString()}<br/>${props.title || props.yField}: <b>${value?.toFixed(2) || '-'}${props.unit}</b>`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
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
      formatter: `{value}${props.unit}`,
      color: '#6b7280'
    },
    axisLine: {
      show: false
    },
    splitLine: {
      lineStyle: { color: '#f3f4f6' }
    }
  },
  series: [{
    type: 'line',
    data: chartData.value,
    smooth: props.smooth,
    symbol: 'none',
    lineStyle: {
      color: props.color,
      width: 2
    },
    areaStyle: props.showArea ? {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: `${props.color}40` },
        { offset: 1, color: `${props.color}05` }
      ])
    } : undefined
  }],
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
    chart.setOption(option.value)
  }
}

function handleResize() {
  chart?.resize()
}

watch(() => props.data, updateChart, { deep: true })
watch(() => [props.title, props.color, props.showArea], updateChart)

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
