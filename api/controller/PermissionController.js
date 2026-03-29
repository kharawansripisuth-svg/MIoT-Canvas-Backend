const permissionModel = require('../models/PostgreSQL/Permission');

class PermissionController {
    // 1. ดึง Permission ทั้งหมด
    async getPermissions(req, res) {
        try {
            const data = await permissionModel.getAll();
            res.status(200).json({ status: 'Success', data });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 2. สร้าง Permission ใหม่ 
    async createPermission(req, res) {
        const { role_id, permission_name, description } = req.body;
        const user_id = req.user?.id || req.user_id || '00000001';

        try {
            // Check เบื้องต้นกันพลาด
            if (!role_id) {
                return res.status(400).json({ status: 'Error', message: 'role_id is required' });
            }
            if (!permission_name) {
                return res.status(400).json({ status: 'Error', message: 'permission_name is required' });
            }

            // ส่ง role_id เข้าไปด้วยตามที่ Procedure ต้องการ
            await permissionModel.create(role_id, permission_name, description, user_id);
            res.status(201).json({ status: 'Success', message: 'Permission created successfully' });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 3. แก้ไข Permission
    async updatePermission(req, res) {
        const { id } = req.params;
        const { permission_name, description } = req.body;
        const user_id = req.user?.id || req.user_id || '00000001';
        try {
            await permissionModel.update(id, permission_name, description, user_id);
            res.status(200).json({ status: 'Success', message: 'Permission updated successfully' });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 4. ยกเลิก Permission (Soft Delete)
    async cancelPermission(req, res) {
        const { id } = req.params;
        const user_id = req.user?.id || req.user_id || '00000001';
        try {
            await permissionModel.cancel(id, user_id);
            res.status(200).json({ status: 'Success', message: 'Permission cancelled successfully' });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    // 5. กู้คืน Permission
    async restorePermission(req, res) {
        const { id } = req.params;
        const user_id = req.user?.id || req.user_id || '00000001';
        try {
            await permissionModel.restore(id, user_id);
            res.status(200).json({ status: 'Success', message: 'Permission restored successfully' });
        } catch (error) {
            res.status(500).json({ status: 'Error', message: error.message });
        }
    }

    async updateRolePermissions(req, res) {
    const { role_id, permission_names } = req.body;
    const user_id = req.user?.id || req.user_id || '00000001';

    try {
        await permissionModel.saveRolePermissions(role_id, permission_names, user_id);
        res.status(200).json({ status: 'Success', message: 'Mapping updated successfully' });
    } catch (error) {
        res.status(500).json({ status: 'Error', message: error.message });
    }
}
}

module.exports = new PermissionController();