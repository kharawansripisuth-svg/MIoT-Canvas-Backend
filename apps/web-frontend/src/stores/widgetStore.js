import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Widget Types Definition
export const WIDGET_TYPES = {
  CHART: 'chart',
  GAUGE: 'gauge',
  TEXT: 'text',
  IMAGE: 'image',
  MAP: 'map'
}

// Default configurations for each widget type
export const WIDGET_DEFAULTS = {
  [WIDGET_TYPES.CHART]: {
    type: WIDGET_TYPES.CHART,
    title: 'Chart',
    config: {
      measurement: '',
      xField: 'time',
      yFields: [],
      chartType: 'line', // line, bar, area, scatter, pie
      timeRange: '1h',
      aggregation: '',
      tagKey: '',
      tagFilter: '',
      smooth: true,
      limit: 500
    }
  },
  [WIDGET_TYPES.GAUGE]: {
    type: WIDGET_TYPES.GAUGE,
    title: 'Gauge',
    config: {
      measurement: '',
      field: '',
      tagKey: '',
      tagFilter: '',
      min: 0,
      max: 100,
      unit: '',
      thresholds: {
        warning: 70,
        danger: 90
      },
      colorNormal: '#22c55e',
      colorWarning: '#f59e0b',
      colorDanger: '#ef4444'
    }
  },
  [WIDGET_TYPES.TEXT]: {
    type: WIDGET_TYPES.TEXT,
    title: 'Text',
    config: {
      content: 'Enter your text here...',
      fontSize: 'base', // sm, base, lg, xl, 2xl
      alignment: 'left', // left, center, right
      fontWeight: 'normal', // normal, medium, semibold, bold
      textColor: '#374151',
      backgroundColor: '#ffffff'
    }
  },
  [WIDGET_TYPES.IMAGE]: {
    type: WIDGET_TYPES.IMAGE,
    title: 'Image',
    config: {
      url: '',
      altText: '',
      fit: 'cover', // cover, contain, fill, none
      showTitle: true
    }
  },
  [WIDGET_TYPES.MAP]: {
    type: WIDGET_TYPES.MAP,
    title: 'Map',
    config: {
      deviceId: null,
      lat: 13.7563, // Bangkok default
      lng: 100.5018,
      zoom: 13,
      showDeviceMarker: true,
      mapStyle: 'default' // default, satellite, terrain
    }
  }
}

export const useWidgetStore = defineStore('widget', () => {
  // State
  const widgets = ref([])
  const isEditMode = ref(false)
  const selectedWidgetId = ref(null)
  const showWidgetPicker = ref(false)
  const showWidgetEditor = ref(false)
  const dashboardConfig = ref({
    columns: 12,
    rowHeight: 80,
    gap: 16
  })

  // Getters
  const selectedWidget = computed(() => {
    return widgets.value.find(w => w.id === selectedWidgetId.value) || null
  })

  const widgetsByPosition = computed(() => {
    return [...widgets.value].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y
      return a.x - b.x
    })
  })

  // Actions
  function generateId() {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function addWidget(type, position = null) {
    const defaults = WIDGET_DEFAULTS[type]
    if (!defaults) return null

    const widget = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(defaults)),
      // Grid position
      x: position?.x ?? 0,
      y: position?.y ?? getNextYPosition(),
      w: getDefaultWidth(type),
      h: getDefaultHeight(type)
    }

    widgets.value.push(widget)
    showWidgetPicker.value = false

    // Open editor for new widget
    selectedWidgetId.value = widget.id
    showWidgetEditor.value = true

    return widget
  }

  function getDefaultWidth(type) {
    switch (type) {
      case WIDGET_TYPES.CHART: return 6
      case WIDGET_TYPES.GAUGE: return 3
      case WIDGET_TYPES.TEXT: return 4
      case WIDGET_TYPES.IMAGE: return 4
      case WIDGET_TYPES.MAP: return 6
      default: return 4
    }
  }

  function getDefaultHeight(type) {
    switch (type) {
      case WIDGET_TYPES.CHART: return 4
      case WIDGET_TYPES.GAUGE: return 3
      case WIDGET_TYPES.TEXT: return 2
      case WIDGET_TYPES.IMAGE: return 3
      case WIDGET_TYPES.MAP: return 4
      default: return 3
    }
  }

  function getNextYPosition() {
    if (widgets.value.length === 0) return 0
    const maxY = Math.max(...widgets.value.map(w => w.y + w.h))
    return maxY
  }

  function updateWidget(widgetId, updates) {
    const index = widgets.value.findIndex(w => w.id === widgetId)
    if (index !== -1) {
      widgets.value[index] = {
        ...widgets.value[index],
        ...updates,
        config: {
          ...widgets.value[index].config,
          ...(updates.config || {})
        }
      }
    }
  }

  function updateWidgetPosition(widgetId, x, y) {
    const widget = widgets.value.find(w => w.id === widgetId)
    if (widget) {
      widget.x = Math.max(0, Math.min(x, dashboardConfig.value.columns - widget.w))
      widget.y = Math.max(0, y)
    }
  }

  function updateWidgetSize(widgetId, w, h) {
    const widget = widgets.value.find(w => w.id === widgetId)
    if (widget) {
      widget.w = Math.max(2, Math.min(w, dashboardConfig.value.columns - widget.x))
      widget.h = Math.max(2, h)
    }
  }

  function removeWidget(widgetId) {
    const index = widgets.value.findIndex(w => w.id === widgetId)
    if (index !== -1) {
      widgets.value.splice(index, 1)
      if (selectedWidgetId.value === widgetId) {
        selectedWidgetId.value = null
        showWidgetEditor.value = false
      }
    }
  }

  function duplicateWidget(widgetId) {
    const widget = widgets.value.find(w => w.id === widgetId)
    if (!widget) return null

    const newWidget = {
      ...JSON.parse(JSON.stringify(widget)),
      id: generateId(),
      x: 0,
      y: getNextYPosition(),
      title: `${widget.title} (Copy)`
    }

    widgets.value.push(newWidget)
    return newWidget
  }

  function selectWidget(widgetId) {
    selectedWidgetId.value = widgetId
  }

  function editWidget(widgetId) {
    selectedWidgetId.value = widgetId
    showWidgetEditor.value = true
  }

  function closeEditor() {
    showWidgetEditor.value = false
  }

  function toggleEditMode() {
    isEditMode.value = !isEditMode.value
    if (!isEditMode.value) {
      selectedWidgetId.value = null
      showWidgetEditor.value = false
    }
  }

  function openWidgetPicker() {
    showWidgetPicker.value = true
  }

  function closeWidgetPicker() {
    showWidgetPicker.value = false
  }

  // Persistence
  function saveLayout() {
    const layout = widgets.value.map(w => ({
      id: w.id,
      type: w.type,
      title: w.title,
      config: w.config,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h
    }))
    localStorage.setItem('dashboard_widgets', JSON.stringify(layout))
  }

  function loadLayout() {
    try {
      const saved = localStorage.getItem('dashboard_widgets')
      if (saved) {
        widgets.value = JSON.parse(saved)
      } else {
        // Load default widgets
        loadDefaultWidgets()
      }
    } catch (err) {
      console.error('Failed to load layout:', err)
      loadDefaultWidgets()
    }
  }

  function loadDefaultWidgets() {
    widgets.value = [
      {
        id: generateId(),
        type: WIDGET_TYPES.GAUGE,
        title: 'Indoor Temperature',
        config: {
          measurement: 'cu_cisco',
          field: 'intempmeas',
          tagKey: '',
          tagFilter: '',
          min: 0,
          max: 50,
          unit: '°C',
          thresholds: { warning: 30, danger: 40 },
          colorNormal: '#22c55e',
          colorWarning: '#f59e0b',
          colorDanger: '#ef4444'
        },
        x: 0, y: 0, w: 3, h: 3
      },
      {
        id: generateId(),
        type: WIDGET_TYPES.GAUGE,
        title: 'Indoor Humidity',
        config: {
          measurement: 'cu_cisco',
          field: 'inhumidmeas',
          tagKey: '',
          tagFilter: '',
          min: 0,
          max: 100,
          unit: '%',
          thresholds: { warning: 70, danger: 85 },
          colorNormal: '#3b82f6',
          colorWarning: '#f59e0b',
          colorDanger: '#ef4444'
        },
        x: 3, y: 0, w: 3, h: 3
      },
      {
        id: generateId(),
        type: WIDGET_TYPES.CHART,
        title: 'Temperature & Humidity',
        config: {
          measurement: 'cu_cisco',
          xField: 'time',
          yFields: ['intempmeas', 'inhumidmeas'],
          chartType: 'line',
          timeRange: '1h',
          aggregation: '',
          tagKey: '',
          tagFilter: '',
          smooth: true,
          limit: 500
        },
        x: 6, y: 0, w: 6, h: 4
      },
      {
        id: generateId(),
        type: WIDGET_TYPES.TEXT,
        title: 'Welcome',
        config: {
          content: '# MIIoT Dashboard\n\nMonitor your **IoT devices** in real-time.\n\n- Temperature\n- Humidity\n- CO2 levels\n- PM2.5',
          fontSize: 'base',
          alignment: 'left',
          fontWeight: 'normal',
          textColor: '#374151',
          backgroundColor: '#f0f9ff',
          enableMarkdown: true
        },
        x: 0, y: 3, w: 6, h: 3
      }
    ]
  }

  function clearLayout() {
    widgets.value = []
    localStorage.removeItem('dashboard_widgets')
  }

  return {
    // State
    widgets,
    isEditMode,
    selectedWidgetId,
    showWidgetPicker,
    showWidgetEditor,
    dashboardConfig,
    // Getters
    selectedWidget,
    widgetsByPosition,
    // Actions
    addWidget,
    updateWidget,
    updateWidgetPosition,
    updateWidgetSize,
    removeWidget,
    duplicateWidget,
    selectWidget,
    editWidget,
    closeEditor,
    toggleEditMode,
    openWidgetPicker,
    closeWidgetPicker,
    saveLayout,
    loadLayout,
    loadDefaultWidgets,
    clearLayout
  }
})
