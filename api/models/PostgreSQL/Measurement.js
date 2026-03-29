const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Measurement {

    // Helper Function สำหรับจัดการพารามิเตอร์ Query
    getPlaceholders(params) {
        return params.map((_, i) => `$${i + 1}`).join(', ');
    }

    /**
     * ดึงข้อมูลแบบ Filter 
     * (เพิ่มพารามิเตอร์ is_active_only เพื่อกรองตัวที่ลบออก)
     */
    async getMeasurementFilter(customer_id = null, zone_id = null, search_text = null, is_active_only = true) {
        try {
            await db.connect();
            // ส่ง parameter 4 ตัว (เพิ่ม is_active_only)
            const params = [customer_id || null, zone_id || null, search_text || null, is_active_only];
            const result = await db.query(
                `SELECT * FROM public.fn_adm_devicemeasurement_filter($1, $2, $3, $4)`,
                params
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    /**
     * ดึงข้อมูลรายละเอียดตาม ID
     */
    async getMeasurementById(meas_id) {
        try {
            await db.connect();
            const params = [meas_id];
            const result = await db.query(
                `SELECT * FROM public.fn_adm_devicemeasurement_getbyid(${this.getPlaceholders(params)})`, 
                params
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    /**
     * ดึงข้อมูล Config สำหรับ Realtime (ใช้ดึงรายชื่อ Measurement และ Unit)
     */
    async getRealtime(device_id, device_name, device_label, customer_code) {
        try {
            await db.connect();
            const params = [device_id || null, device_name || null, device_label || null, customer_code || null];
            const result = await db.query(
                `SELECT * FROM public.fn_adm_get_device_realtime_config($1, $2, $3, $4)`,
                params
            );
            return result.rows[0];
        } finally {
            await db.close?.();
        }
    }

    /**
     * ดึงข้อมูลสรุปสถานะอุปกรณ์สำหรับการ์ด 4 ใบ (Dashboard)
     */
    async getDeviceStatusSummary() {
        try {
            await db.connect();
            const result = await db.query(
                `SELECT * FROM public.fn_adm_device_status_summary()`
            );
            return result.rows[0]; 
        } finally {
            await db.close?.();
        }
    }

    /**
     * เพิ่มหรือแก้ไขข้อมูลการวัด (Upsert)
     */
    async updateMeasurement(meas_id, device_id, zone_id, name, label, unit_id, min, max, user) {
        try {
            await db.connect();
            const params = [meas_id, device_id, zone_id, name, label, unit_id, min, max, user];
            await db.query(
                `CALL public.sp_adm_devicemeasurement_update(${this.getPlaceholders(params)})`,
                params
            );
            return { success: true };
        } finally {
            await db.close?.();
        }
    }

    /**
     * ลบข้อมูลแบบ Soft Delete (เปลี่ยน is_active เป็น false)
     */
    async deleteMeasurement(meas_id, user) {
        try {
            await db.connect();
            // บันทึกคนลบ และเวลาที่ลบ (cancel_at) ลงไปด้วยใน Procedure
            const params = [meas_id, user];
            await db.query(
                `CALL public.sp_adm_devicemeasurement_delete(${this.getPlaceholders(params)})`,
                params
            );
            return { success: true };
        } finally {
            await db.close?.();
        }
    }

    /**
     * กู้คืนข้อมูล (Restore) - เปลี่ยนสถานะกลับเป็น true
     */
    async restoreMeasurement(meas_id, user) {
        try {
            await db.connect();
            const params = [meas_id, user];
            
            // เปลี่ยนมาใช้ CALL เหมือนตัวอื่นๆ แล้วครับตอง
            await db.query(
                `CALL public.sp_adm_devicemeasurement_restore(${this.getPlaceholders(params)})`,
                params
            );
            
            return { success: true };
        } finally {
            await db.close?.();
        }
    }

    /**
     * อัปเดตข้อมูลหน่วยวัด (Unit)
     */
    async setUnit(device_name, device_label, meas_name, unit, unit_code) {
        try {
            await db.connect();
            const params = [device_name, device_label, meas_name, unit, unit_code];
            const result = await db.query(
                `CALL public.sp_adm_devicemeasurement_set_unit(${this.getPlaceholders(params)})`,
                params
            );
            return { success: true, data: result }; 
        } finally { 
            await db.close?.();
        }
    }

    /**
     * อัปเดตเกณฑ์การแจ้งเตือน (Threshold)
     */
    async setThreshold(device_name, device_label, meas_name, v_min, v_max, t_min, t_max) {
        try {
            await db.connect();
            const params = [device_name, device_label, meas_name, v_min, v_max, t_min, t_max];
            const result = await db.query(
                `CALL public.sp_adm_devicemeasurement_set_threshold(${this.getPlaceholders(params)})`,
                params
            );
            return { success: true, data: result };
        } finally {
            await db.close?.();
        }
    }
}

module.exports = Measurement;