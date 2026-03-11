const influxService = require('../Service/influx_service');
const pgService = require('../Service/postgres_service');

const influx = influxService.getClient();

class MeasurementController {
  // Query measurements with time range
  async queryMeasurements(req, res) {
    try {
      const { device_id, device_name, device_number, from, to, fields, limit = 1000 } = req.body;

      // Get device info
      let deviceInfo;
      if (device_id) {
        const result = await pgService.query(`
          SELECT device_name, device_number FROM devices WHERE device_id = $1
        `, [device_id]);
        if (result.length === 0) {
          return res.status(404).json({ success: false, error: 'Device not found' });
        }
        deviceInfo = result[0];
      } else if (device_name && device_number !== undefined) {
        deviceInfo = { device_name, device_number };
      } else {
        return res.status(400).json({ success: false, error: 'device_id or device_name/device_number required' });
      }

      // Get measurements config from PostgreSQL
      const measurementsResult = await pgService.query(`
        SELECT * FROM fn_get_device_measurements_nicev2($1, $2)
      `, [deviceInfo.device_name, deviceInfo.device_number]);

      if (measurementsResult.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Build field list
      const availableFields = [...new Set(measurementsResult.map(r => r.field_base).filter(Boolean))];
      const selectedFields = fields && fields.length > 0
        ? fields.filter(f => availableFields.includes(f))
        : availableFields;

      if (selectedFields.length === 0) {
        selectedFields.push(...availableFields);
      }

      const measurements = [...new Set(measurementsResult.map(r => r.dbinflux).filter(Boolean))];
      const tokenids = [...new Set(measurementsResult.map(r => r.tokenid).filter(Boolean))];

      // Build time range filter
      let timeFilter = '';
      if (from) {
        timeFilter += ` AND time >= '${new Date(from).toISOString()}'`;
      }
      if (to) {
        timeFilter += ` AND time <= '${new Date(to).toISOString()}'`;
      }

      const tokenidFilter = tokenids.map(t => `"tokenid" = '${t}'`).join(' OR ');

      // Query each measurement
      const queries = measurements.map(measurement => `
        SELECT time, ${selectedFields.join(', ')}
        FROM "${measurement}"
        WHERE (${tokenidFilter})${timeFilter}
        ORDER BY time DESC
        LIMIT ${Math.min(limit, 10000)}
      `);

      const results = await Promise.all(queries.map(q => influx.query(q).catch(() => [])));
      const data = results.flat().sort((a, b) => new Date(b.time) - new Date(a.time));

      res.json({
        success: true,
        device: deviceInfo,
        fields: selectedFields,
        count: data.length,
        data: data
      });
    } catch (err) {
      console.error('Error querying measurements:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Export measurements as CSV
  async exportMeasurements(req, res) {
    try {
      const { device_id, device_name, device_number, from, to, fields } = req.body;

      // Reuse query logic
      const queryResult = await this.queryMeasurementsInternal({
        device_id, device_name, device_number, from, to, fields, limit: 50000
      });

      if (!queryResult.success) {
        return res.status(400).json(queryResult);
      }

      const { data, device } = queryResult;

      if (data.length === 0) {
        return res.status(404).json({ success: false, error: 'No data found' });
      }

      // Generate CSV
      const headers = Object.keys(data[0]).filter(k => k !== 'time');
      const csvHeaders = ['timestamp', ...headers].join(',');
      const csvRows = data.map(row => {
        const time = new Date(row.time).toISOString();
        const values = headers.map(h => row[h] ?? '');
        return [time, ...values].join(',');
      });

      const csv = [csvHeaders, ...csvRows].join('\n');

      const filename = `${device.device_name}_${device.device_number}_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (err) {
      console.error('Error exporting measurements:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Internal query method for reuse
  async queryMeasurementsInternal({ device_id, device_name, device_number, from, to, fields, limit = 1000 }) {
    try {
      let deviceInfo;
      if (device_id) {
        const result = await pgService.query(`
          SELECT device_name, device_number FROM devices WHERE device_id = $1
        `, [device_id]);
        if (result.length === 0) {
          return { success: false, error: 'Device not found' };
        }
        deviceInfo = result[0];
      } else if (device_name && device_number !== undefined) {
        deviceInfo = { device_name, device_number };
      } else {
        return { success: false, error: 'device_id or device_name/device_number required' };
      }

      const measurementsResult = await pgService.query(`
        SELECT * FROM fn_get_device_measurements_nicev2($1, $2)
      `, [deviceInfo.device_name, deviceInfo.device_number]);

      if (measurementsResult.length === 0) {
        return { success: true, device: deviceInfo, data: [] };
      }

      const availableFields = [...new Set(measurementsResult.map(r => r.field_base).filter(Boolean))];
      const selectedFields = fields && fields.length > 0
        ? fields.filter(f => availableFields.includes(f))
        : availableFields;

      const measurements = [...new Set(measurementsResult.map(r => r.dbinflux).filter(Boolean))];
      const tokenids = [...new Set(measurementsResult.map(r => r.tokenid).filter(Boolean))];

      let timeFilter = '';
      if (from) timeFilter += ` AND time >= '${new Date(from).toISOString()}'`;
      if (to) timeFilter += ` AND time <= '${new Date(to).toISOString()}'`;

      const tokenidFilter = tokenids.map(t => `"tokenid" = '${t}'`).join(' OR ');

      const queries = measurements.map(measurement => `
        SELECT time, ${selectedFields.join(', ')}
        FROM "${measurement}"
        WHERE (${tokenidFilter})${timeFilter}
        ORDER BY time DESC
        LIMIT ${Math.min(limit, 50000)}
      `);

      const results = await Promise.all(queries.map(q => influx.query(q).catch(() => [])));
      const data = results.flat().sort((a, b) => new Date(b.time) - new Date(a.time));

      return { success: true, device: deviceInfo, fields: selectedFields, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Get available measurements/fields for a device
  async getAvailableFields(req, res) {
    try {
      const { device_name, device_number } = req.query;

      if (!device_name || device_number === undefined) {
        return res.status(400).json({ success: false, error: 'device_name and device_number required' });
      }

      const measurementsResult = await pgService.query(`
        SELECT * FROM fn_get_device_measurements_nicev2($1, $2)
      `, [device_name, device_number]);

      const fields = [...new Set(measurementsResult.map(r => r.field_base).filter(Boolean))];
      const measurements = [...new Set(measurementsResult.map(r => r.dbinflux).filter(Boolean))];

      res.json({
        success: true,
        device_name,
        device_number,
        fields,
        measurements
      });
    } catch (err) {
      console.error('Error fetching available fields:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new MeasurementController();
