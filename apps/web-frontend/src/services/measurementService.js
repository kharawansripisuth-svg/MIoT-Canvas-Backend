import api from './api'

export const measurementService = {
  // Query measurements with time range
  async queryMeasurements({ deviceId, deviceName, deviceNumber, from, to, fields, limit }) {
    return api.post('/measurements/query', {
      device_id: deviceId,
      device_name: deviceName,
      device_number: deviceNumber,
      from,
      to,
      fields,
      limit
    })
  },

  // Export measurements as CSV
  async exportMeasurements({ deviceId, deviceName, deviceNumber, from, to, fields }) {
    const response = await api.post('/measurements/export', {
      device_id: deviceId,
      device_name: deviceName,
      device_number: deviceNumber,
      from,
      to,
      fields
    }, {
      responseType: 'blob'
    })

    // Handle blob response for download
    return response
  },

  // Download CSV helper
  downloadCSV(blob, filename) {
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'export.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  // Get available fields for a device
  async getAvailableFields(deviceName, deviceNumber) {
    return api.get('/measurements/fields', {
      params: { device_name: deviceName, device_number: deviceNumber }
    })
  }
}

export default measurementService
