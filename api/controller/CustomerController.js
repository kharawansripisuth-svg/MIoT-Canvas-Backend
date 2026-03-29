const pgService = require('../../service/services/postgres-service');
const Newid = require('../lib/Newid');
const newId = new Newid();
const db = new pgService();
const { saveLog } = require('../lib/ActivityLogger');

class Customer {
    // Helper สำหรับเรียกใช้งาน SQL
    dbCall = async (funcName, params = []) => {
        try {
            await db.connect();
            const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
            
            const isProcedure = funcName.startsWith('sp_');
            const sql = isProcedure 
                ? `CALL public.${funcName}(${placeholders})` 
                : `SELECT * FROM public.${funcName}(${placeholders})`;

            const result = await db.query(sql, params);
            
            if (!result || result.rows.length === 0) return isProcedure ? 'SUCCESS' : null;
            if (funcName.includes('_get')) return result.rows; 
            
            return result.rows[0][funcName] !== undefined ? result.rows[0][funcName] : result.rows[0];
        } catch (error) {
            throw error;
        } finally {
            if (db.close) await db.close();
        }
    };

    // 1. ดึงข้อมูลลูกค้าทั้งหมด
    getCustomers = async (req, res) => {
        try {
            const customers = await this.dbCall('fn_adm_customer_get', ['all']);
            return res.status(200).json({ success: true, customers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 2. ดึงข้อมูลเฉพาะลูกค้าที่ยังใช้งานอยู่
    getActiveCustomers = async (req, res) => {
        try {
            const customers = await this.dbCall('fn_adm_customer_get', ['active']);
            return res.status(200).json({ success: true, customers });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 3. ดึงข้อมูลตาม ID
    getCustomerById = async (req, res) => {
        try {
            const { customer_id } = req.params;
            const customers = await this.dbCall('fn_adm_customer_get', ['id', customer_id]);
            if (!customers || customers.length === 0) return res.status(404).json({ success: false, error: 'Customer not found' });
            return res.status(200).json({ success: true, customer: customers[0] });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 4. เพิ่มข้อมูลลูกค้าใหม่ (แก้ไขจุดส่ง Parameter ให้ครบ 6 ตัว)
    addCustomer = async (req, res) => {
        try {
            const { customer_name_en, customer_name_th, customer_code } = req.body;
            const created_by = req.user?.member_id || '00000001';

            if (!customer_name_en || !customer_code) {
                return res.status(400).json({ success: false, error: 'Missing required fields' });
            }

            const newIdStr = await newId.genCustomerId();
            
            //เติม null เป็น Parameter ตัวที่ 6 เพื่อรองรับ INOUT p_result ของ Procedure
            const result = await this.dbCall('sp_adm_customer_insert', [
                newIdStr, 
                customer_name_en, 
                customer_name_th, 
                customer_code, 
                created_by,
                null // ตัวที่ 6 สำหรับ p_result
            ]);

            // ตรวจสอบว่าผลลัพธ์จาก DB มีคำว่า ERROR หรือไม่
            if (typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            // [LOG] บันทึกกิจกรรมการเพิ่มลูกค้า
            await saveLog(req, {
                action: 'Add_Customer',
                table: 'adm_customer',
                id: newIdStr,
                new_data: req.body
            });
            
            return res.status(201).json({ success: true, message: result, customer_id: newIdStr });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 5. แก้ไขข้อมูลลูกค้า
    editCustomer = async (req, res) => {
        try {
            const { customer_id } = req.params;
            const d = req.body;
            const updated_by = req.user?.member_id || '00000001';

            const oldData = await this.dbCall('fn_adm_customer_get', ['id', customer_id]);

            const result = await this.dbCall('sp_adm_customer_update', [
                customer_id, 
                d.customer_name_en, 
                d.customer_name_th, 
                d.customer_code, 
                d.is_active, 
                d.is_selected, 
                updated_by,
                d.phone_number, 
                d.email,
                d.tax_id
            ]);
            
            if (result && typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(404).json({ success: false, error: result });
            }

            await saveLog(req, {
                action: 'Edit_Customer',
                table: 'adm_customer',
                id: customer_id,
                old_data: oldData ? oldData[0] : null,
                new_data: d
            });

            return res.status(200).json({ success: true, message: result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 6. อัปเดตสถานะการเลือก
    updateSelectStatus = async (req, res) => {
        try {
            const { customer_id } = req.params;
            const { is_selected } = req.body;
            const updated_by = req.user?.member_id || '00000001';

            const result = await this.dbCall('sp_adm_customer_update', [
                customer_id, null, null, null, null, is_selected, updated_by
            ]);
            
            if (result && typeof result === 'string' && result.startsWith('ERROR')) return res.status(404).json({ success: false, error: result });

            await saveLog(req, {
                action: 'Update_Select_Status',
                table: 'adm_customer',
                id: customer_id,
                new_data: { is_selected }
            });

            return res.status(200).json({ success: true, message: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 7. อัปเดตสถานะการใช้งาน
    setActiveStatus = async (req, res) => {
        try {
            const { customer_id, status } = req.body;
            const updated_by = req.user?.member_id || '00000001';

            const result = await this.dbCall('sp_adm_customer_update', [
                customer_id, null, null, null, status, null, updated_by
            ]);
            
            if (result && typeof result === 'string' && result.startsWith('ERROR')) return res.status(404).json({ success: false, error: result });

            await saveLog(req, {
                action: 'Set_Active_Status',
                table: 'adm_customer',
                id: customer_id,
                new_data: { is_active: status }
            });

            return res.status(200).json({ success: true, message: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
}

module.exports = new Customer();