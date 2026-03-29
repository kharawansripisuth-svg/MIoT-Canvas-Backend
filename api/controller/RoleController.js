const roleModel = require('../models/PostgreSQL/Role');

class RoleController {
    // 1. ดึงข้อมูล Role ทั้งหมด
    async getRoles(req, res) {
        try {
            const data = await roleModel.getAll();
            res.status(200).json({ status: 'Success', data });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 2. เพิ่ม Role ใหม่
    async createRole(req, res) {
        const { role_name, description } = req.body;
        
        // ดึง user_id จาก req.user
        // ถ้าไม่มี ให้ใช้ ID ที่มีตัวตนจริงในตาราง adm_member 
        const user_id = req.user?.id || req.user_id || '00000001'; 

        try {
            // ตรวจสอบข้อมูลเบื้องต้น
            if (!role_name) {
                return res.status(400).json({ status: 'Error', message: 'role_name is required' });
            }

            await roleModel.create(role_name, description, user_id);
            res.status(201).json({ status: 'Success', message: 'Role created successfully' });
        } catch (error) {
            // ถ้า Error จะส่งข้อความจาก Database ออกมาเลย (จะได้รู้ว่า Log พังเพราะอะไร)
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 3. แก้ไข Role
    async updateRole(req, res) {
        const { id } = req.params;
        const { role_name, description } = req.body;
        const user_id = req.user?.id || req.user_id || '00000001';

        try {
            if (!id) {
                return res.status(400).json({ status: 'Error', message: 'role_id (id) is required' });
            }

            await roleModel.update(id, role_name, description, user_id);
            res.status(200).json({ status: 'Success', message: 'Role updated successfully' });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 4. ลบ Role
    async cancelRole(req, res) {
    const { id } = req.params;
    const user_id = req.user?.id || req.user_id || '00000001';

    try {
        if (!id) {
            return res.status(400).json({ status: 'Error', message: 'Role ID is required' });
        }

        await roleModel.delete(id, user_id);
        res.status(200).json({ 
            status: 'Success', 
            message: `Role ${id} deleted (cancelled) successfully` 
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}

    // 5. กู้คืน Role
    async restoreRole(req, res) {
    const { id } = req.params;
    const user_id = req.user?.id || req.user_id || '00000001';

    try {
        if (!id) {
            return res.status(400).json({ status: 'Error', message: 'Role ID is required' });
        }

        await roleModel.restore(id, user_id);
        res.status(200).json({ 
            status: 'Success', 
            message: `Role ${id} has been restored successfully.` 
        });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}

    async getRoleOptions(req, res) {
    try {
        // ดึงเฉพาะตัวที่ยังไม่ถูก cancel เพื่อเอาไปทำตัวเลือก
        const data = await roleModel.getAll(); 
        const options = data.filter(r => !r.cancel_at).map(r => ({
            value: r.role_id,
            label: r.role_name
        }));
        res.status(200).json({ status: 'Success', data: options });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}

    async getRoleDropdown(req, res) {
    try {
        await db.connect();
        const result = await db.query('SELECT * FROM public.fn_adm_role_get_dropdown()');
        res.status(200).json({ status: 'Success', data: result.rows });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}
}
module.exports = new RoleController();