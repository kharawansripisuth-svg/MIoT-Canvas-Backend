const InfluxService = require('../../../service/services/influx-service');
const influx = InfluxService.getClient();

class Influx{
    async realtimeInflux(measurement_list, device_name, device_label, customer_code) {
        // แปลงเป็น safe fields
        const safeFields = measurement_list
            .split(',')
            .map(f => `"${f.trim()}"`)
            .join(', ');
    
        // สร้าง InfluxQL
        const influxQuery = `
            SELECT ${safeFields}
            FROM "${customer_code}"."autogen"."${device_name}"
            WHERE "${device_name}" = '${device_label}'
            ORDER BY time DESC
        `;
    
        console.log('InfluxQL >>>', influxQuery);
        return await influx.query(influxQuery);
    }

    async historicalInflux(measurement_list, device_name, device_label, customer_code, start_time, end_time) {
            const safeFields = measurement_list
            .split(',')
            .map(f => `"${f.trim()}"`)
            .join(', ');

            const influxQuery = `
            SELECT ${safeFields}
            FROM "${customer_code}"."autogen"."${device_name}"
            WHERE "${device_name}" = '${device_label}'
            AND time >= '${start_time}' AND time <= '${end_time}'
            ORDER BY time DESC`;

            console.log('InfluxQL >>>', influxQuery);
            return await influx.query(influxQuery);
    }
}


module.exports = Influx;