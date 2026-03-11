import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAlertStore = defineStore('alert', () => {
  // State
  const alerts = ref([])
  const alertHistory = ref([])
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const enabledAlerts = computed(() => {
    return alerts.value.filter(a => a.enabled)
  })

  const alertsByDevice = computed(() => {
    const grouped = {}
    alerts.value.forEach(alert => {
      const deviceId = alert.device_id
      if (!grouped[deviceId]) {
        grouped[deviceId] = []
      }
      grouped[deviceId].push(alert)
    })
    return grouped
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  // Actions
  async function fetchAlerts() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/alerts')
      alerts.value = response.alerts || []
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch alerts:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchDeviceAlerts(deviceId) {
    try {
      const response = await api.get(`/devices/${deviceId}/alerts`)
      return response.alerts || []
    } catch (err) {
      console.error('Failed to fetch device alerts:', err)
      return []
    }
  }

  async function createAlert(alertData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/alerts', alertData)
      alerts.value.push(response.alert)
      return response.alert
    } catch (err) {
      error.value = err.message
      console.error('Failed to create alert:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAlert(alertId, updates) {
    loading.value = true
    error.value = null

    try {
      const response = await api.put(`/alerts/${alertId}`, updates)
      const index = alerts.value.findIndex(a => a.alert_id === alertId)
      if (index !== -1) {
        alerts.value[index] = response.alert
      }
      return response.alert
    } catch (err) {
      error.value = err.message
      console.error('Failed to update alert:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAlert(alertId) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/alerts/${alertId}`)
      const index = alerts.value.findIndex(a => a.alert_id === alertId)
      if (index !== -1) {
        alerts.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to delete alert:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAlertHistory(options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.deviceId) params.append('device_id', options.deviceId)
      if (options.from) params.append('from', options.from)
      if (options.to) params.append('to', options.to)
      if (options.limit) params.append('limit', options.limit)

      const response = await api.get(`/alerts/history?${params.toString()}`)
      alertHistory.value = response.history || []
      return alertHistory.value
    } catch (err) {
      console.error('Failed to fetch alert history:', err)
      return []
    }
  }

  function addNotification(notification) {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    notifications.value.unshift({
      id,
      ...notification,
      read: false,
      timestamp: new Date().toISOString()
    })

    // Limit notification count
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  function markNotificationRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  function markAllRead() {
    notifications.value.forEach(n => {
      n.read = true
    })
  }

  function clearNotifications() {
    notifications.value = []
  }

  function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    // State
    alerts,
    alertHistory,
    notifications,
    loading,
    error,
    // Getters
    enabledAlerts,
    alertsByDevice,
    unreadNotifications,
    // Actions
    fetchAlerts,
    fetchDeviceAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    fetchAlertHistory,
    addNotification,
    markNotificationRead,
    markAllRead,
    clearNotifications,
    removeNotification
  }
})
