const influxService = require('../Service/influx_service');

const influx = influxService.getClient();

class InfluxDirectController {
  // Get all measurements (like tables)
  async getMeasurements(req, res) {
    try {
      const result = await influx.query('SHOW MEASUREMENTS');
      const measurements = result.map(r => r.name);

      res.json({
        success: true,
        measurements
      });
    } catch (err) {
      console.error('Error fetching measurements:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get field keys for a measurement
  async getFields(req, res) {
    try {
      const { measurement } = req.params;
      const result = await influx.query(`SHOW FIELD KEYS FROM "${measurement}"`);

      const fields = result.map(r => ({
        name: r.fieldKey,
        type: r.fieldType
      }));

      res.json({
        success: true,
        measurement,
        fields
      });
    } catch (err) {
      console.error('Error fetching fields:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get tag keys for a measurement
  async getTags(req, res) {
    try {
      const { measurement } = req.params;
      const result = await influx.query(`SHOW TAG KEYS FROM "${measurement}"`);

      const tags = result.map(r => r.tagKey);

      res.json({
        success: true,
        measurement,
        tags
      });
    } catch (err) {
      console.error('Error fetching tags:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get unique tag values
  async getTagValues(req, res) {
    try {
      const { measurement, tag } = req.params;
      const result = await influx.query(`SHOW TAG VALUES FROM "${measurement}" WITH KEY = "${tag}"`);

      const values = result.map(r => r.value);

      res.json({
        success: true,
        measurement,
        tag,
        values
      });
    } catch (err) {
      console.error('Error fetching tag values:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Query data with flexible options
  async queryData(req, res) {
    try {
      const {
        measurement,
        fields = ['*'],
        tags = {},
        timeRange = '1h',
        from,
        to,
        aggregation = null, // mean, sum, count, min, max
        groupBy = null, // time(1m), time(5m), etc.
        limit = 1000,
        orderDesc = true
      } = req.body;

      if (!measurement) {
        return res.status(400).json({ success: false, error: 'measurement is required' });
      }

      // Build SELECT clause
      let selectFields = fields.join(', ');
      if (aggregation && groupBy) {
        selectFields = fields.map(f => f === '*' ? '*' : `${aggregation}("${f}") as ${f}`).join(', ');
      }

      // Build WHERE clause
      let whereClause = '';
      const conditions = [];

      // Time range
      if (from && to) {
        conditions.push(`time >= '${new Date(from).toISOString()}' AND time <= '${new Date(to).toISOString()}'`);
      } else if (timeRange) {
        conditions.push(`time > now() - ${timeRange}`);
      }

      // Tag filters
      Object.entries(tags).forEach(([key, value]) => {
        if (value) {
          conditions.push(`"${key}" = '${value}'`);
        }
      });

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }

      // Build GROUP BY clause
      let groupByClause = '';
      if (groupBy) {
        groupByClause = `GROUP BY ${groupBy}`;
      }

      // Build ORDER BY clause
      const orderClause = orderDesc ? 'ORDER BY time DESC' : 'ORDER BY time ASC';

      // Build full query
      const query = `
        SELECT ${selectFields}
        FROM "${measurement}"
        ${whereClause}
        ${groupByClause}
        ${orderClause}
        LIMIT ${Math.min(limit, 10000)}
      `.trim();

      console.log('InfluxQL >>>', query);

      const result = await influx.query(query);

      // Get available fields for this measurement
      const fieldKeysResult = await influx.query(`SHOW FIELD KEYS FROM "${measurement}"`);
      const availableFields = fieldKeysResult.map(r => r.fieldKey);

      res.json({
        success: true,
        measurement,
        query,
        count: result.length,
        fields: availableFields,
        data: result
      });
    } catch (err) {
      console.error('Error querying data:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get latest values for all devices/tags in a measurement
  async getLatest(req, res) {
    try {
      const { measurement } = req.params;
      const { tag = 'cu_cisco', limit = 10 } = req.query;

      // Get unique tag values
      const tagValuesResult = await influx.query(`SHOW TAG VALUES FROM "${measurement}" WITH KEY = "${tag}"`);
      const tagValues = tagValuesResult.map(r => r.value);

      // Get latest for each
      const latestData = [];

      for (const tagValue of tagValues.slice(0, limit)) {
        const result = await influx.query(`
          SELECT * FROM "${measurement}"
          WHERE "${tag}" = '${tagValue}'
          ORDER BY time DESC
          LIMIT 1
        `);

        if (result.length > 0) {
          latestData.push({
            [tag]: tagValue,
            ...result[0]
          });
        }
      }

      res.json({
        success: true,
        measurement,
        tag,
        count: latestData.length,
        data: latestData
      });
    } catch (err) {
      console.error('Error fetching latest:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Simple devices list based on tag values
  async getDevices(req, res) {
    try {
      // Get devices from cu_cisco measurement
      const ciscoTags = await influx.query(`SHOW TAG VALUES FROM "cu_cisco" WITH KEY = "cu_cisco"`);
      const energyTags = await influx.query(`SHOW TAG VALUES FROM "cu_energymeter" WITH KEY = "device"`).catch(() => []);

      const devices = [
        ...ciscoTags.map(t => ({
          id: t.value,
          name: t.value,
          type: 'sensor',
          measurement: 'cu_cisco',
          tag: 'cu_cisco',
          status: 'online'
        })),
        ...energyTags.map(t => ({
          id: t.value,
          name: t.value,
          type: 'energy_meter',
          measurement: 'cu_energymeter',
          tag: 'device',
          status: 'online'
        }))
      ];

      res.json({
        success: true,
        count: devices.length,
        devices
      });
    } catch (err) {
      console.error('Error fetching devices:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new InfluxDirectController();
