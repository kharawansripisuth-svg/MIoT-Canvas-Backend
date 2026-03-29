const pgService = require('../../service/services/postgres-service');
const db = new pgService();

class GetId {
    /**
     * ดึง Device ID จากชื่อหรือ Label
     * ปรับให้ใช้ Pattern เดียวกับโมดูลอื่น (เรียกผ่าน Function)
     */
    async getDeviceIdbyName(device_name, device_label) {
        try {
            await db.connect();
            const result = await db.query(
                `SELECT public.fn_adm_device_get_id_by_name($1, $2) as device_id`,
                [device_name || null, device_label || null]
            );
            
            // คืนค่ากลับไป ถ้าไม่มีข้อมูลจะคืนค่าเป็น null
            return result.rows[0]?.device_id || null;
        } catch (error) {
            console.error("Error in getDeviceIdbyName:", error);
            throw error;
        } finally {
            // เช็คว่ามีฟังก์ชัน close ไหมก่อนเรียก
            if (db.close) {
                await db.close();
            }
        }
    }
}

module.exports = GetId;