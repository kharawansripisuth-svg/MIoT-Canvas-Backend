const pgService = require('../../service/services/postgres-service');
const db = new pgService();

class Newid {
    async getNextFromSequence(sequenceName, padLength = 8) {
        try {
            await db.connect();
            const result = await db.query(`SELECT nextval('public.${sequenceName}')`);
            const nextVal = result.rows[0].nextval;
            return String(nextVal).padStart(padLength, '0');
        } catch (err) {
            console.error(`Error fetching sequence ${sequenceName}:`, err);
            throw err; 
        } finally {
            if (db.close) await db.close();
        }
    }

    // กลุ่ม 8 หลัก (00000001)
    async genDeviceId() { return await this.getNextFromSequence('device_id_seq', 8); }
    async genMemberId() { return await this.getNextFromSequence('member_id_seq', 8); }
    async genCustomerId() { return await this.getNextFromSequence('customer_id_seq', 8); }
    async genVendorId() { return await this.getNextFromSequence('vendor_id_seq', 8); }
    async genModelId() { return await this.getNextFromSequence('model_id_seq', 8); }
    async genRoleId() { return await this.getNextFromSequence('role_id_seq', 8); }
    async genPermissionId() { return await this.getNextFromSequence('permission_id_seq', 8); }
    async genRuleId() { return await this.getNextFromSequence('rule_id_seq', 8); }
    async genBuildingId() { return await this.getNextFromSequence('building_id_seq', 8); }
    async genFloorId() { return await this.getNextFromSequence('floor_id_seq', 8); }
    async genUnitId() { return await this.getNextFromSequence('unit_id_seq', 8); }
    async genDashboardId() { return await this.getNextFromSequence('dashboard_id_seq', 8); }
    async genTopicId() { return await this.getNextFromSequence('topic_id_seq', 8); } 

    // กลุ่ม 4 หลัก (0001)
    async genBrokerId() { return await this.getNextFromSequence('broker_id_seq', 4); }
    async genZoneId() { return await this.getNextFromSequence('zone_id_seq', 4); }
    async genMeasId() { return await this.getNextFromSequence('measurement_id_seq', 4); }
    async genAlertId() { return await this.getNextFromSequence('alert_id_seq', 4); } // อิงตามตาราง adm_alert ที่ใช้ meas_id(4)
}

module.exports = Newid;