require('dotenv').config();
const pgService = require('../../service/services/postgres-service');
const db = new pgService();
const { saveLog } = require('../lib/ActivityLogger'); // ตัวเก็บ Log ที่ตองมีอยู่แล้ว

class UnitController {
    
    // --- [Helper Functions] ---
    sendResponse = (res, data, message = 'Success', status = 200) => {
        return res.status(status).json({ success: true, message, ...data });
    }

    handleError = (res, error) => {
        console.error('Database Error:', error);
        return res.status(500).json({ success: false, error: error.message || error });
    };

    dbCall = async (funcName, params = []) => {
        try {
            await db.connect();
            const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
            const isProcedure = funcName.startsWith('sp_');

            const sql = isProcedure
                ? `CALL public.${funcName}(${placeholders})`
                : `SELECT * FROM public.${funcName}(${placeholders})`;

            const result = await db.query(sql, params);

            if (isProcedure) {
                const procResult = result.rows[0]?.p_result || result.rows[0]?.[''] || 'SUCCESS';
                return procResult; 
            }

            if (!result || !result.rows || result.rows.length === 0) return null;
            if (funcName.includes('getall')) return result.rows;

            return result.rows[0][funcName] !== undefined ? result.rows[0][funcName] : result.rows[0];
        } catch (error) { throw error; } finally { if (db.close) await db.close(); }
    };

    // --- [Main Actions] ---

    // 1. ดึงแผนกทั้งหมด
    getUnits = async (req, res) => {
        try {
            const units = await this.dbCall('fn_adm_unit_getall', []);
            this.sendResponse(res, { units: units || [] });
        } catch (error) { this.handleError(res, error); }
    };

    // 2. เพิ่มแผนกใหม่
    saveUnit = async (req, res) => {
        const d = req.body;
        try {
            const params = [
                null, 
                d.unit_name, 
                d.formula || '', 
                d.description || '', 
                req.user?.member_id || '00000001'
            ];
            const result = await this.dbCall('sp_adm_unit_insert', params);

            // บันทึก Activity Log
            await saveLog(req, {
                member_id: req.user?.member_id || 'SYSTEM',
                action: 'Insert Unit',
                table: 'adm_unit',
                id: result,
                new_data: d
            });

            this.sendResponse(res, { unit_id: result }, 'Unit saved successfully');
        } catch (error) { this.handleError(res, error); }
    };

    // 3. แก้ไขแผนก
    updateUnit = async (req, res) => {
        const d = req.body;
        try {
            const params = [d.unit_id, d.unit_name, d.formula, d.description];
            const result = await this.dbCall('sp_adm_unit_update', params);

            // บันทึก Activity Log
            await saveLog(req, {
                member_id: req.user?.member_id || 'SYSTEM',
                action: 'Update Unit',
                table: 'adm_unit',
                id: d.unit_id,
                new_data: d
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    // 4. ลบ/ระงับแผนก
    deleteUnit = async (req, res) => {
        try {
            const id = req.params.unit_id;
            const result = await this.dbCall('sp_adm_unit_delete', [id]);

            // บันทึก Activity Log
            await saveLog(req, {
                member_id: req.user?.member_id || 'SYSTEM',
                action: 'Delete Unit',
                table: 'adm_unit',
                id: id,
                new_data: { is_active: false }
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };
}

module.exports = new UnitController();