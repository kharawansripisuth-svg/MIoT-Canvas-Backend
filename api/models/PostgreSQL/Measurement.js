const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Measurement {

    async getMeasurement() {
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_devicemeasurement_getall()`
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }
    
    async getMeasurementById(meas_id) {
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_devicemeasurement_getbyid($1)`,
                [meas_id]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async getRealtime(device_id, device_name, device_label, customer_code) {
        await db.connect();
        try{
            const result = await db.query(
                `SELECT * FROM fn_adm_devicemeasurement_get_realtime_update($1, $2, $3, $4)`,
                [device_id, device_name, device_label, customer_code]
            );
            return result.rows[0];
        } finally {
            await db.close?.();
        }
    }

    async setUnit(device_name, device_label, meas_name, unit, unit_code) {
        await db.connect();
        try{
            const result = await db.query(
                `SELECT * FROM fn_adm_devicemeasurement_set_unit_by_measurement($1, $2, $3, $4, $5)`,
                [device_name, device_label, meas_name, unit, unit_code]
            );
            return result.rows[0];
        } finally {
            await db.close?.();
        }
    }

    async setThreshold(device_name, device_label, meas_name, value_min, value_max,threshold_min, threshold_max) {
        await db.connect();
        try{
            const result = await db.query(
                `SELECT * FROM fn_set_threshold($1, $2, $3, $4, $5, $6, $7)`,
                [device_name, device_label, meas_name, value_min, value_max, threshold_min, threshold_max]
            );
            return result.rows[0];
        } finally {
            await db.close?.();
        }
    }
}

module.exports = Measurement;