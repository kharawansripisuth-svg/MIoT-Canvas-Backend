const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Role {
    // GET: ดึง Role ทั้งหมด
    async getAll() {
        try {
            await db.connect();
            const result = await db.query('SELECT * FROM public.fn_adm_role_get_all()');
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    // POST: เพิ่ม Role ใหม่
    async create(role_name, description, user_id) {
        try {
            await db.connect();
            const params = [role_name, description, user_id];
            await db.query('CALL public.sp_adm_role_insert($1, $2, $3)', params);
            return { success: true };
        } finally {
            await db.close?.();
        }
    }

    // PUT: แก้ไข Role
    async update(role_id, role_name, description, user_id) {
        try {
            await db.connect();
            const params = [role_id, role_name, description, user_id];
            await db.query('CALL public.sp_adm_role_update($1, $2, $3, $4)', params);
            return { success: true };
        } finally {
            await db.close?.();
        }
    }

    // PUT: ลบ Role
    async delete(role_id, user_id) {
    try {
        await db.connect();
        const params = [role_id, user_id];
        await db.query('CALL public.sp_adm_role_delete($1, $2)', params);
        return { success: true };
    } finally {
        await db.close?.();
    }
}
    // PUT: กู้คืน Role
    async restore(role_id, user_id) {
    try {
        await db.connect();
        const params = [role_id, user_id];
        await db.query('CALL public.sp_adm_role_restore($1, $2)', params);
        return { success: true };
    } finally {
        await db.close?.();
    }
}
}

module.exports = new Role();