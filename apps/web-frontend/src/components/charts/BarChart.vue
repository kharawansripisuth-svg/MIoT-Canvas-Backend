<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
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
    default: '300px'
  },
  horizontal: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref(null)
let chart = null

const option = computed(() => {
  const baseAxis = {
    type: 'category',
    data: props.categories,
    axisLabel: {
      color: '#6b7280',
      rotate: props.horizontal ? 0 : 45
    },
    axisLine: {
      lineStyle: { color: '#e5e7eb' }
    }
  }

  const valueAxis = {
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
  }

  return {
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
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const point = params[0]
        return `${point.name}: <b>${point.value?.toFixed(2) || '-'}${props.unit}</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: props.title ? '15%' : '8%',
      containLabel: true
    },
    xAxis: props.horizontal ? valueAxis : baseAxis,
    yAxis: props.horizontal ? baseAxis : valueAxis,
    series: [{
      type: 'bar',
      data: props.data,
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(
          props.horizontal ? 0 : 0,
          props.horizontal ? 0 : 1,
          props.horizontal ? 1 : 0,
          props.horizontal ? 0 : 0,
          [
            { offset: 0, color: `${props.color}80` },
            { offset: 1, color: props.color }
          ]
        ),
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
      }
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
    chart.setOption(option.value)
  }
}

function handleResize() {
  chart?.resize()
}

watch(() => [props.data, props.categories], updateChart, { deep: true })
watch(() => [props.title, props.color, props.horizontal], updateChart)

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
