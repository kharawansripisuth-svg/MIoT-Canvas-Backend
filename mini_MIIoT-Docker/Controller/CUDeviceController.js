const influxService = require('../Service/influx_service');
const pgService = require('../Service/postgres_service');

const influx = influxService.getClient();

class CUDeviceController {

  async selectDeviceMeasurement(req, res) {
    try {

      const { device_name, device_number } = req.body;

      if (!device_name || device_number === undefined) {
        return res.status(400).json({ 
          error: 'Missing or invalid parameters' 
        });
      }

      // 1. Query จาก PostgreSQL function
      const pgResult = await pgService.query(
        `SELECT * FROM fn_get_device_measurements_nicev2($1, $2)`,
        [device_name, device_number]
      );

      // 2. สร้างค่า field, measurement, tokenid
      const devicenameDistinct = [...new Set(pgResult.map(r => r.devicelabel).filter(Boolean))][0];
      const fieldsDistinct = [...new Set(pgResult.map(r => r.field_base).filter(Boolean))].join(', ');
      const measurementsDistinct = [...new Set(pgResult.map(r => r.dbinflux).filter(Boolean))];
      const tokenidsDistinct = [...new Set(pgResult.map(r => r.tokenid).filter(Boolean))];

      const tokenidFilter = tokenidsDistinct.map(t => `"${measurementsDistinct}" = '${t}'`).join(' OR ');

      const influxQuery = `
        SELECT ${fieldsDistinct}
        FROM ${measurementsDistinct.map(m => `"${m}"`).join(', ')}
        WHERE ${tokenidFilter}
        ORDER BY time DESC
        LIMIT 10
      `;

      console.log('InfluxQL >>>', influxQuery);

      const influxResult = await influx.query(influxQuery);

      res.json({
        device_name: devicenameDistinct,
        data: influxResult
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new CUDeviceController();