const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Device {
    async getActiveDevices() {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_get_device();`
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async getDeviceById(device_id, device_name, device_label) {
        const db = new pgService();
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_getdevicebyid_update($1, $2, $3);`,
                [device_id, device_name, device_label]
            );
            return result.rows;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }

    async addDevice(newDeviceId, device_name, device_label, device_type, topic_name, newBrokerId, broker_host, broker_port, customer_code, location, device_area, newVendorId, vendor_name, description, serial_number) {
        await db.connect();
        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_device_insert_update_v2($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
                [newDeviceId, device_name, device_label, device_type, topic_name, newBrokerId, broker_host, broker_port, customer_code, location, device_area, newVendorId, vendor_name, description, serial_number]
            );
            return result.rows[0];
        } catch (error) {
            throw error; // ให้ controller จัดการ error
        } finally {
            await db.close?.();
        }
    }

    async getBroker(broker_host, broker_port) {
        const db = new pgService();
        await db.connect();
        try {
            const getBroker = await db.query(
                `SELECT fn_adm_broker_getbyhostport($1, $2)`,
                [broker_host, broker_port]
            );
            return getBroker.rows[0];
        } finally {
            await db.close?.();
        }
    }

    async checkTopic(topic_id) {
        const db = new pgService();
        await db.connect();
        try {
            const checkTopic = await db.query(
                `SELECT fn_adm_topic_checkselected($1)`,
                [topic_id]
            );
            return checkTopic;
        } finally {
            await db.close?.();
        }
    }

    async setTopic(topic_id, status) {
        const db = new pgService();
        await db.connect();
        try {
            const setTopic = await db.query(
                `CALL sp_adm_topic_setselected($1, $2)`,
                [topic_id, status]
            );
            return setTopic;
        } finally {
            await db.close?.();
        }
    }

    async searchDevice(device_id, device_name, device_label, customer_code) {
        const db = new pgService();
        await db.connect();
        try {
            const searchDevice = await db.query(
                `SELECT * FROM fn_adm_device_search($1, $2, $3, $4)`,
                [device_id, device_name, device_label, customer_code]
            );
            return searchDevice;
        } finally {
            await db.close?.();
        }
    }

    async setActive(device_id, status) {
        const db = new pgService();
        await db.connect();
        try {
            const setActive = await db.query(
                `CALL sp_adm_device_setactive($1, $2)`,
                [device_id, status]
            );
            return setActive;
        } finally {
            await db.close?.();
        }
    }
    async editDevice(device_id, device_name, device_label, device_area, description, topic_name, location, broker_host, broker_port) {
        await db.connect();
        try {
            const editDevice = await db.query(
                `SELECT * FROM fn_adm_device_edit_device($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [device_id, device_name, device_label, device_area, description,location, topic_name, broker_host, broker_port]
            );
            return editDevice;
        } finally {
            await db.close?.();
        }
    }
    async addDeviceAPI(deviceId, name, apiKey, location, model) {
        const query = `
            INSERT INTO devices (device_id, name, location, model, api_key, register_date, status)
            VALUES ($1, $2, $3, $4, $5, NOW(), 'active')
            RETURNING *;
        `;
        const values = [deviceId, name, location, model, apiKey];
        const res = await pool.query(query, values);
        return res.rows[0];
    }

    async findDevice(deviceId, apiKey) {
        const query = `SELECT * FROM devices WHERE device_id = $1 AND api_key = $2;`;
        const values = [deviceId, apiKey];
        const res = await pool.query(query, values);
        return res.rows[0];
    }

}
module.exports = Device;
