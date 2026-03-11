const pgService = require('../Service/postgres_service');

class DeviceController {
  // Get all devices with status
  async getAllDevices(req, res) {
    try {
      const result = await pgService.query(`
        SELECT
          d.device_id,
          d.device_name,
          d.device_number,
          d.device_label,
          d.device_type,
          d.location,
          d.created_at,
          d.updated_at,
          CASE
            WHEN d.last_seen > NOW() - INTERVAL '1 minute' THEN 'online'
            WHEN d.last_seen > NOW() - INTERVAL '5 minutes' THEN 'idle'
            ELSE 'offline'
          END as status,
          d.last_seen
        FROM devices d
        ORDER BY d.device_name, d.device_number
      `);

      res.json({
        success: true,
        count: result.length,
        devices: result
      });
    } catch (err) {
      console.error('Error fetching devices:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get single device by ID
  async getDeviceById(req, res) {
    try {
      const { id } = req.params;
      const result = await pgService.query(`
        SELECT
          d.*,
          CASE
            WHEN d.last_seen > NOW() - INTERVAL '1 minute' THEN 'online'
            WHEN d.last_seen > NOW() - INTERVAL '5 minutes' THEN 'idle'
            ELSE 'offline'
          END as status
        FROM devices d
        WHERE d.device_id = $1
      `, [id]);

      if (result.length === 0) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }

      res.json({
        success: true,
        device: result[0]
      });
    } catch (err) {
      console.error('Error fetching device:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get latest measurements for a device
  async getDeviceLatest(req, res) {
    try {
      const { id } = req.params;
      const influxService = require('../Service/influx_service');
      const influx = influxService.getClient();

      // First get device info from PostgreSQL
      const deviceResult = await pgService.query(`
        SELECT device_name, device_number, device_label
        FROM devices
        WHERE device_id = $1
      `, [id]);

      if (deviceResult.length === 0) {
        return res.status(404).json({ success: false, error: 'Device not found' });
      }

      const device = deviceResult[0];

      // Get measurements config for this device
      const measurementsResult = await pgService.query(`
        SELECT * FROM fn_get_device_measurements_nicev2($1, $2)
      `, [device.device_name, device.device_number]);

      if (measurementsResult.length === 0) {
        return res.json({ success: true, device: device, measurements: [] });
      }

      // Build InfluxDB query for latest data
      const fields = [...new Set(measurementsResult.map(r => r.field_base).filter(Boolean))];
      const measurements = [...new Set(measurementsResult.map(r => r.dbinflux).filter(Boolean))];
      const tokenids = [...new Set(measurementsResult.map(r => r.tokenid).filter(Boolean))];

      if (measurements.length === 0 || tokenids.length === 0) {
        return res.json({ success: true, device: device, measurements: [] });
      }

      const tokenidFilter = tokenids.map(t => `"tokenid" = '${t}'`).join(' OR ');

      const queries = measurements.map(measurement => `
        SELECT ${fields.join(', ')}
        FROM "${measurement}"
        WHERE ${tokenidFilter}
        ORDER BY time DESC
        LIMIT 1
      `);

      const results = await Promise.all(queries.map(q => influx.query(q).catch(() => [])));
      const latestData = results.flat();

      res.json({
        success: true,
        device: device,
        measurements: latestData,
        timestamp: latestData[0]?.time || null
      });
    } catch (err) {
      console.error('Error fetching latest measurements:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Update device last_seen timestamp
  async updateDeviceLastSeen(deviceName, deviceNumber) {
    try {
      await pgService.query(`
        UPDATE devices
        SET last_seen = NOW()
        WHERE device_name = $1 AND device_number = $2
      `, [deviceName, deviceNumber]);
    } catch (err) {
      console.error('Error updating device last_seen:', err);
    }
  }
}

module.exports = new DeviceController();
