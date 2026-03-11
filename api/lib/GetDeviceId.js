const pgService = require('../../service/services/postgres-service');
const db = new pgService();
class GetId {
    async getDeviceIdbyName(device_name, device_label) {
        await db.connect();
        try {
            const result = await db.query(
                `SELECT device_id FROM adm_device WHERE device_name = $1 OR device_label = $2`,
                [device_name, device_label]);
            return result.rows[0]?.device_id || null;
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            await db.close?.();
        }
    }
}
module.exports = GetId;