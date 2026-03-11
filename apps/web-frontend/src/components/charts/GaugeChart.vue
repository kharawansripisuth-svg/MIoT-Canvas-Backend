<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  title: {
    type: String,
    default: ''
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
    default: '200px'
  },
  thresholds: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
let chart = null

const gaugeColor = computed(() => {
  if (props.thresholds.danger && props.value > props.thresholds.danger) {
    return '#ef4444'
  }
  if (props.thresholds.warning && props.value > props.thresholds.warning) {
    return '#f59e0b'
  }
  return props.color
})

const option = computed(() => ({
  series: [{
    type: 'gauge',
    startAngle: 200,
    endAngle: -20,
    min: props.min,
    max: props.max,
    radius: '85%',
    center: ['50%', '60%'],
    splitNumber: 5,
    axisLine: {
      lineStyle: {
        width: 15,
        color: [
          [0.3, '#22c55e'],
          [0.7, '#3b82f6'],
          [1, '#ef4444']
        ]
      }
    },
    pointer: {
      length: '60%',
      width: 6,
      itemStyle: {
        color: gaugeColor.value
      }
    },
    axisTick: {
      distance: -20,
      length: 8,
      lineStyle: {
        color: '#fff',
        width: 2
      }
    },
    splitLine: {
      distance: -25,
      length: 15,
      lineStyle: {
        color: '#fff',
        width: 3
      }
    },
    axisLabel: {
      distance: -35,
      color: '#6b7280',
      fontSize: 10
    },
    title: {
      show: true,
      offsetCenter: [0, '80%'],
      fontSize: 12,
      color: '#6b7280'
    },
    detail: {
      valueAnimation: true,
      fontSize: 24,
      fontWeight: 'bold',
      offsetCenter: [0, '40%'],
      formatter: `{value}${props.unit}`,
      color: gaugeColor.value
    },
    data: [{
      value: props.value,
      name: props.title
    }]
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

watch(() => props.value, updateChart)
watch(() => [props.min, props.max, props.title, props.color], updateChart)

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
