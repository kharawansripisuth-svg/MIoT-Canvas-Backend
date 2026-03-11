import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import websocketService from '@/services/websocketService'
import { useDeviceStore } from './deviceStore'

export const useRealtimeStore = defineStore('realtime', () => {
  // State
  const isConnected = ref(false)
  const latestData = ref(new Map())
  const dataHistory = ref(new Map())
  const maxHistorySize = ref(100)
  const connectionError = ref(null)
  const lastUpdate = ref(null)

  // Getters
  const connectionStatus = computed(() => {
    return isConnected.value ? 'connected' : 'disconnected'
  })

  const getLatestForDevice = computed(() => {
    return (deviceName, deviceNumber) => {
      const key = `${deviceName}_${deviceNumber}`
      return latestData.value.get(key) || null
    }
  })

  const getHistoryForDevice = computed(() => {
    return (deviceName, deviceNumber) => {
      const key = `${deviceName}_${deviceNumber}`
      return dataHistory.value.get(key) || []
    }
  })

  const allLatestData = computed(() => {
    return Object.fromEntries(latestData.value)
  })

  // Actions
  async function connect() {
    try {
      await websocketService.connect()
      isConnected.value = true
      connectionError.value = null
      setupListeners()
    } catch (err) {
      connectionError.value = err.message
      isConnected.value = false
      throw err
    }
  }

  function setupListeners() {
    // Handle incoming measurements
    websocketService.on('measurement', (data) => {
      handleMeasurement(data)
    })

    // Handle alerts
    websocketService.on('alert', (data) => {
      handleAlert(data)
    })

    // Handle connection status
    websocketService.on('connected', (data) => {
      isConnected.value = true
      connectionError.value = null
    })

    websocketService.on('disconnect', (data) => {
      isConnected.value = false
    })

    websocketService.on('error', (error) => {
      connectionError.value = error.message || 'WebSocket error'
    })
  }

  function handleMeasurement(data) {
    const { device, data: measurementData, timestamp } = data

    if (!device) return

    const key = `${device.device_name}_${device.device_number}`

    // Update latest data
    latestData.value.set(key, {
      ...measurementData,
      device,
      timestamp
    })

    // Update history
    let history = dataHistory.value.get(key) || []
    history.push({
      ...measurementData,
      timestamp
    })

    // Trim history if too large
    if (history.length > maxHistorySize.value) {
      history = history.slice(-maxHistorySize.value)
    }
    dataHistory.value.set(key, history)

    // Update last update timestamp
    lastUpdate.value = timestamp

    // Update device status in device store
    const deviceStore = useDeviceStore()
    deviceStore.updateDeviceStatus(device.device_name, device.device_number, 'online')
  }

  function handleAlert(data) {
    console.log('Alert received:', data)
    // This can be extended to show toast notifications
  }

  function subscribe(topics) {
    websocketService.subscribe(topics)
  }

  function unsubscribe(topics) {
    websocketService.unsubscribe(topics)
  }

  function disconnect() {
    websocketService.disconnect()
    isConnected.value = false
    latestData.value.clear()
    dataHistory.value.clear()
  }

  function clearHistory(deviceName, deviceNumber) {
    if (deviceName && deviceNumber) {
      const key = `${deviceName}_${deviceNumber}`
      dataHistory.value.delete(key)
    } else {
      dataHistory.value.clear()
    }
  }

  function setMaxHistorySize(size) {
    maxHistorySize.value = size
  }

  return {
    // State
    isConnected,
    latestData,
    dataHistory,
    maxHistorySize,
    connectionError,
    lastUpdate,
    // Getters
    connectionStatus,
    getLatestForDevice,
    getHistoryForDevice,
    allLatestData,
    // Actions
    connect,
    subscribe,
    unsubscribe,
    disconnect,
    clearHistory,
    setMaxHistorySize
  }
})
