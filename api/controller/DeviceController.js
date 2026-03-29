require('dotenv').config();
const pgService = require('../../service/services/postgres-service');
const Newid = require('../lib/Newid');
const newId = new Newid();
const db = new pgService();
const { saveLog } = require('../lib/ActivityLogger');

class DeviceController {

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

            if (isProcedure) return 'SUCCESS';
            if (!result || !result.rows || result.rows.length === 0) return null;
            
            if (funcName.includes('_get') || funcName.includes('_filter') || funcName.includes('_summary')) {
                return result.rows; 
            }

            return result.rows[0][funcName] !== undefined 
                ? result.rows[0][funcName] 
                : result.rows[0];
        } catch (error) {
            throw error;
        } finally {
            if (db.close) await db.close();
        }
    };

    // --- [Main Functions] ---
    
    // 1. ดึงสรุปสถานะ (อัปเดตใหม่รองรับ 5 การ์ด: Total, Online, Offline, Idle, Maintenance)
    getDeviceSummary = async (req, res) => {
        try {
            const result = await this.dbCall('fn_adm_device_status_summary', []);
            // ปรับ Default Object ให้ตรงกับผลลัพธ์จาก Function ใน DB
            const summaryData = result && result.length > 0 ? result[0] : { 
                total_all: 0, 
                online_count: 0, 
                offline_count: 0, 
                idle_count: 0, 
                maintenance_count: 0 
            };

            this.sendResponse(res, { summary: summaryData });
        } catch (error) { this.handleError(res, error); }
    };

    // 2. ดึง Master Data สำหรับ Dropdown 
    getFormMaster = async (req, res) => {
    try {
        // result ที่ได้จาก dbCall จะเป็น [ { json_data: { models: [...], vendors: [...] } } ]
        const result = await this.dbCall('fn_adm_get_device_form_master', []);
        
        // ต้องเช็คที่ result[0] เพราะมันคืนค่าเป็น Array ของ rows
        if (result && result.length > 0 && result[0].json_data) {
            // ส่งเฉพาะก้อน json_data ออกไปให้หน้าบ้าน
            this.sendResponse(res, result[0].json_data, 'Master data retrieved successfully');
        } else {
            this.sendResponse(res, {}, 'No master data found');
        }
    } catch (error) { 
        this.handleError(res, error); 
    }
};
    // 3. ดึงข้อมูลอุปกรณ์พร้อม Filter
    getDevice = async (req, res) => {
        try {
            const { customer_id, zone_id, is_online } = req.query;
            const devices = await this.dbCall('fn_adm_device_get', ['all', null]);
            
            let filtered = devices || [];
            if (customer_id) filtered = filtered.filter(d => d.customer_id === customer_id);
            if (zone_id) filtered = filtered.filter(d => d.zone_id === zone_id);
            
            if (is_online !== undefined) {
                const onlineStatus = is_online === 'true';
                filtered = filtered.filter(d => d.is_online === onlineStatus);
            }

            this.sendResponse(res, { device: filtered });
        } catch (error) { this.handleError(res, error); }
    };

    // 4. ฟังก์ชันค้นหา
    searchDevice = async (req, res) => {
        try {
            const result = await this.dbCall('fn_adm_device_get', ['all', null]); 
            this.sendResponse(res, { device: result || [] }, 'Search device successfully');
        } catch (error) { this.handleError(res, error); }
    };

    // 5. เพิ่มอุปกรณ์ (แก้ไข Parameter ให้ตรงกับ Rename ใน DB)
    addDevice = async (req, res) => {
        try {
            const d = req.body;
            const created_by = req.user?.member_id || '00000001';
            
            const newDeviceId = await newId.genDeviceId();
            const topicId = d.topic_id || null; 

            let tagsValue = typeof d.tags === 'object' ? JSON.stringify(d.tags) : (d.tags || "{}");

            // เรียงลำดับ Parameter ให้ตรงกับ Procedure sp_adm_device_insert
            // ตรวจสอบชื่อ p_created_by (แก้จาก p_create_by เดิม)
            const params = [
                newDeviceId,             // 1. p_device_id
                d.customer_id,           // 2. p_customer_id
                topicId,                 // 3. p_topic_id
                d.vendor_id,             // 4. p_vendor_id 
                d.broker_id,             // 5. p_broker_id
                d.model_id,              // 6. p_model_id 
                d.device_name,           // 7. p_device_name
                d.device_label,          // 8. p_device_label
                d.zone_id,               // 9. p_device_area (zone_id)
                d.serial_number,         // 10. p_serial_number
                d.mac_address || null,   // 11. p_mac_address
                d.ip_address || null,    // 12. p_ip_address
                d.device_type,           // 13. p_device_type
                d.protocol_type || 'MQTT', // 14. p_protocol_type
                tagsValue,               // 15. p_tags
                d.note || null,          // 16. p_note
                created_by               // 17. p_created_by (Standardized)
            ];

            await this.dbCall('sp_adm_device_insert', params);
            
            await saveLog(req, { 
                action: 'Add_Device', 
                table: 'adm_device', 
                id: newDeviceId, 
                new_data: d 
            });

            this.sendResponse(res, { device_id: newDeviceId }, 'Device added successfully', 201);
        } catch (error) { this.handleError(res, error); }
    };

    // 6. แก้ไขข้อมูล (แก้ไข Parameter ให้ตรงกับ Rename ใน DB)
    editDevice = async (req, res) => {
        try {
            const { device_id } = req.body;
            const d = req.body;
            const updated_by = req.user?.member_id || '00000001';

            const oldData = await this.dbCall('fn_adm_device_get', ['id', device_id]);
            const params = [
                device_id,               // 1. p_device_id
                d.device_name,           // 2. p_device_name
                d.device_label,          // 3. p_device_label
                d.zone_id,               // 4. p_zone_id
                d.serial_number,         // 5. p_serial_number
                d.mac_address || null,   // 6. p_mac_address
                d.ip_address || null,    // 7. p_ip_address
                d.note || null,          // 8. p_note
                updated_by               // 9. p_updated_by (Standardized)
            ];

            await this.dbCall('sp_adm_device_update', params);
            
            await saveLog(req, { 
                action: 'Edit_Device', 
                table: 'adm_device', 
                id: device_id, 
                old_data: oldData ? oldData[0] : null, 
                new_data: d 
            });

            this.sendResponse(res, {}, 'Device updated successfully');
        } catch (error) { this.handleError(res, error); }
    };

    // 7. ดึงข้อมูลรายชิ้น
    getDeviceById = async (req, res) => {
        try {
            const { id } = req.params; 
            const deviceResult = await this.dbCall('fn_adm_device_get', ['id', id]);
            if (!deviceResult || deviceResult.length === 0) return res.status(404).json({ success: false, error: 'Device not found' });
            this.sendResponse(res, { device: deviceResult[0] });
        } catch (error) { this.handleError(res, error); }
    };

    // 8. เปิด-ปิด การใช้งาน (แก้ไข Parameter)
    setDeviceActive = async (req, res) => {
        try {
            const { device_id, status } = req.body;
            const updated_by = req.user?.member_id || '00000001';
            
            // ส่ง parameter ให้ตรงกับ sp_adm_device_set_active
            await this.dbCall('sp_adm_device_set_active', [device_id, status, updated_by]);

            await saveLog(req, { 
                action: 'Set_Active_Device', 
                table: 'adm_device', 
                id: device_id, 
                new_data: { is_active: status },
                detail: `Device ${device_id} is_active set to ${status}`
            });

            this.sendResponse(res, {}, 'Device status updated successfully');
        } catch (error) { this.handleError(res, error); }
    };

    // 9. ลบ (Soft Delete ผ่าน Procedure)
    deleteDevice = async (req, res) => {
        try {
            const { id } = req.params;
            const updated_by = req.user?.member_id || '00000001';

            await this.dbCall('sp_adm_device_delete', [id, updated_by]); 

            await saveLog(req, { 
                action: 'Delete_Device', 
                table: 'adm_device', 
                id: id,
                detail: `Device ${id} was soft deleted`
            });

            this.sendResponse(res, {}, 'Device deleted successfully');
        } catch (error) { this.handleError(res, error); }
    };
}

module.exports = new DeviceController();