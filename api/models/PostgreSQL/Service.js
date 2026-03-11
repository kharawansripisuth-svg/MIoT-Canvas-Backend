const pgService = require('../../../service/services/postgres-service');

class Service {

    async fetchDevice() {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_get_telegraf_config()`
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async syncCache() {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getall_names()`
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async saveTopic(topic_id, topic_name) {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `Call sp_adm_topic_insert_ignore($1, $2)`,
                [topic_id, topic_name]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async getDeviceIdFromTopic(topic_name) {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_getid_by_topic($1)`,
                [topic_name]
            );
            return result;
        } finally {
            await db.close?.();
        }
    }
    async checkField(deviceId, measurementName) {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_measurement_check_exists($1, $2)`,
                [deviceId, measurementName]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }
    async saveField(device_id, meas_id, meas_name) {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `CALL sp_adm_measurement_insert($1, $2, $3)`,
                [device_id, meas_id, meas_name]
            );
            return result;
        } finally {
            await db.close?.();
        }
    }
    async deviceDistinct() {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_getall_names()`
            );
            return result;
        } finally {
            await db.close?.();
        }
    }

}

module.exports = Service;