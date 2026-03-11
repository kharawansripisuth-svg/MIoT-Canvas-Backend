import api from './api'

export const influxService = {
  // Get all measurements (like tables)
  async getMeasurements() {
    return api.get('/influx/measurements')
  },

  // Get fields for a measurement
  async getFields(measurement) {
    return api.get(`/influx/measurements/${measurement}/fields`)
  },

  // Get tags for a measurement
  async getTags(measurement) {
    return api.get(`/influx/measurements/${measurement}/tags`)
  },

  // Get tag values
  async getTagValues(measurement, tag) {
    return api.get(`/influx/measurements/${measurement}/tags/${tag}/values`)
  },

  // Query data with options
  async queryData(options) {
    return api.post('/influx/query', options)
  },

  // Get latest data
  async getLatest(measurement, tag = 'cu_cisco', limit = 10) {
    return api.get(`/influx/measurements/${measurement}/latest`, {
      params: { tag, limit }
    })
  },

  // Get devices from tags
  async getDevices() {
    return api.get('/influx/devices')
  }
}

export default influxService
