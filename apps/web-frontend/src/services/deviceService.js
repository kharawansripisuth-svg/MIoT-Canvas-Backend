import api from './api'


export const getDevices = async () => {
  const res = await api.get('/getDevice');
  return res.data.device
};


export const getDeviceBy = async (id, label, name) => {
  const res = await api.get(`/devices?`, {
    params: {
      device_id: id,
      device_label: label,
      device_name: name
    }
  });
  return res.data;
};

export const addDevice = async (name, label, type,topic, host, port, customer_code, serial, vendor, area, location, description) => {
  const res = await api.put('/addDevice', {
    device_name:name,
    device_label:label,
    device_type:type,
    topic_name:topic,
    broker_host:host,
    broker_port:port,
    customer_code:customer_code,
    serial_number:serial,
    vendor_name:vendor,
    device_area:area,
    location:location,
    description:description
  });
  return res.data;
  }

  // // Get single device by ID
  // async getDeviceById(id) {
  //   return api.get(`/getDeviceBy?device_id=${id}`)
  // },

  // // Get latest measurements for a device
  // async getDeviceLatest(id) {
  //   return api.get(`/devices/${id}/latest`)
  // },

  // // Get device alerts
  // async getDeviceAlerts(deviceId) {
  //   return api.get(`/devices/${deviceId}/alerts`)
  // }

export default {
  getDevices,
  getDeviceBy,
  addDevice
};
