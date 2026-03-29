const pgService = require('../../service/services/postgres-service');
const db = new pgService();

/**
 * Common Activity Logger
 * ใช้สำหรับบันทึก Log ลง Database จากทุก Controller
 */
const saveLog = async (req, data) => {
    try {
        await db.connect();
        
        const actorId = String(data.member_id || req.user?.member_id || '00000001');
        const targetId = String(data.id || '00000000');
        
        const params = [
            actorId,
            data.action || 'ACTION',
            data.table || 'UNKNOWN',
            targetId,
            data.old_data ? JSON.stringify(data.old_data) : null,
            data.new_data ? JSON.stringify(data.new_data) : null,
            req.ip || '127.0.0.1',
            req.headers['user-agent'] || 'Unknown',
            actorId,
            '' // p_result (INOUT)
        ];

        const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `CALL public.sp_adm_log_insert(${placeholders})`;
        
        await db.query(sql, params);
        
    } catch (error) {
        console.error('Global Logging Failed:', error.message);
    } finally {
        if (db.close) await db.close();
    }
};

module.exports = { saveLog };