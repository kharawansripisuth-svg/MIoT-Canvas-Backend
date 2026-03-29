const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Permission {
    async getAll() {
        try {
            await db.connect();
            const result = await db.query('SELECT * FROM public.fn_adm_permission_get_all()');
            return result.rows;
        } finally { await db.close?.(); }
    }

    async create(role_id, name, desc, user_id) {
    try {
        await db.connect();
        const params = [role_id, name, desc, user_id];
        await db.query('CALL public.sp_adm_permission_insert($1, $2, $3, $4)', params);
        return { success: true };
    } finally {
        await db.close?.();
    }
}

    async update(id, name, desc, user_id) {
        try {
            await db.connect();
            await db.query('CALL public.sp_adm_permission_update($1, $2, $3, $4)', [id, name, desc, user_id]);
            return { success: true };
        } finally { await db.close?.(); }
    }

    async cancel(id, user_id) {
        try {
            await db.connect();
            await db.query('CALL public.sp_adm_permission_cancel($1, $2)', [id, user_id]);
            return { success: true };
        } finally { await db.close?.(); }
    }

    async restore(id, user_id) {
        try {
            await db.connect();
            await db.query('CALL public.sp_adm_permission_restore($1, $2)', [id, user_id]);
            return { success: true };
        } finally { await db.close?.(); }
    }

    async saveRolePermissions(role_id, permission_names, user_id) {
    try {
        await db.connect();
        const params = [role_id, permission_names, user_id];
        await db.query('CALL public.sp_adm_role_permission_save($1, $2, $3)', params);
        return { success: true };
    } finally {
        await db.close?.();
    }
}
}

module.exports = new Permission();