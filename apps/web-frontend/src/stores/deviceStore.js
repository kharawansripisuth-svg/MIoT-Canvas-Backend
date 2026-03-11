import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import deviceService from '@/services/deviceService'

export const useDeviceStore = defineStore('device', () => {
  // State
  const devices = ref([])
  const selectedDeviceId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const selectedDevice = computed(() => {
    return devices.value.find(d => d.device_id === selectedDeviceId.value) || null
  })

  const onlineDevices = computed(() => {
    return devices.value.filter(d => d.status === 'online')
  })

  const offlineDevices = computed(() => {
    return devices.value.filter(d => d.status === 'offline')
  })

  const devicesByType = computed(() => {
    const grouped = {}
    devices.value.forEach(device => {
      const type = device.device_type || 'unknown'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(device)
    })
    return grouped
  })

  // Actions
  async function fetchDevices() {
    loading.value = true
    error.value = null

    try {
      const response = await deviceService.getAllDevices()
      devices.value = response.devices || []

      // Auto-select first device if none selected
      if (!selectedDeviceId.value && devices.value.length > 0) {
        selectedDeviceId.value = devices.value[0].device_id
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch devices:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDeviceById(id) {
    try {
      const response = await deviceService.getDeviceById(id)
      const device = response.device

      // Update device in list
      const index = devices.value.findIndex(d => d.device_id === id)
      if (index !== -1) {
        devices.value[index] = { ...devices.value[index], ...device }
      }

      return device
    } catch (err) {
      console.error('Failed to fetch device:', err)
      throw err
    }
  }

  function selectDevice(deviceId) {
    selectedDeviceId.value = deviceId
  }

  function updateDeviceStatus(deviceName, deviceNumber, status) {
    const device = devices.value.find(
      d => d.device_name === deviceName && d.device_number === deviceNumber
    )
    if (device) {
      device.status = status
      device.last_seen = new Date().toISOString()
    }
  }

  function clearSelection() {
    selectedDeviceId.value = null
  }

  return {
    // State
    devices,
    selectedDeviceId,
    loading,
    error,
    // Getters
    selectedDevice,
    onlineDevices,
    offlineDevices,
    devicesByType,
    // Actions
    fetchDevices,
    fetchDeviceById,
    selectDevice,
    updateDeviceStatus,
    clearSelection
  }
})
