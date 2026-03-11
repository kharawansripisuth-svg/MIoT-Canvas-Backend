import influx from '../db/influx.js';

class DeviceData {
    async addData(deviceId, payload) {
        await influx.writePoints([
            {
                measurement: 'sensor_data',
                tags: { device_id: deviceId },
                fields: {
                    temp: payload.temp || 0,
                    humidity: payload.humidity || 0
                },
                timestamp: new Date()
            }
        ]);
        return { stored: true, payload };
    }

    async getData(limit = 10) {
        const result = await influx.query(
            `SELECT * FROM sensor_data ORDER BY time DESC LIMIT ${limit}`
        );
        return result;
    }
}

module.exports = DeviceData;