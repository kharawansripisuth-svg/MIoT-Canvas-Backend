require('dotenv').config();
const pgService = require('../../service/services/postgres-service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = new pgService();
const { saveLog } = require('../lib/ActivityLogger');
const emailService = require('../../service/services/email-service'); 

class MemberController {
    
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

    // 1. REGISTER
    registerMember = async (req, res) => {
        const d = req.body;
        try {
            if (!d.password || d.password.length < 12) {
                return res.status(400).json({ success: false, error: 'Password must be at least 12 characters long' });
            }

            const isExists = await this.dbCall('fn_adm_member_check_exists', [d.username, d.email]);
            if (isExists === true || isExists === 'true') {
                return res.status(409).json({ success: false, error: 'Username or Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(d.password, 10);
            
            const unit = await db.query(`SELECT unit_id FROM adm_unit WHERE unit_name = $1`, [d.department]);
            if (!unit.rows.length) return res.status(404).json({ success: false, error: 'Department not found' });

            const customer = await db.query(`SELECT customer_id FROM adm_customer WHERE customer_id = $1`, [d.customer_id]);
            if (!customer.rows.length) return res.status(404).json({ success: false, error: 'Customer not found' });

            const params = [
                null, customer.rows[0].customer_id, d.role || '00000001', d.username,
                d.fname_en, d.lname_en, d.fnameth, d.lnameth, hashedPassword,
                d.email, d.position || '', d.phone, req.user?.member_id || '00000001'
            ];

            const result = await this.dbCall('sp_adm_member_insert', params);
            if (typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            await saveLog(req, {
                member_id: req.user?.member_id || result,
                action: 'Register',
                table: 'adm_member',
                id: result,
                new_data: { username: d.username, email: d.email }
            });

            this.sendResponse(res, { member_id: result }, 'Registered successfully', 201);
        } catch (error) { this.handleError(res, error); }
    };

    // 2. LOGIN
    login = async (req, res) => {
        const { email, username, password } = req.body;
        const identity = username || email;
        try {
            const user = await this.dbCall('fn_adm_member_login', [identity, null]);
            
            // เพิ่มการเช็คชื่อคอลัมน์ให้ยืดหยุ่น (เผื่อตองเปลี่ยนเป็น member_id)
            const m_id = user?.member_id || user?.memberid;
            const r_name = user?.role_name || user?.rolename;

            if (!user || !(await bcrypt.compare(password, user.password.trim()))) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const accessToken = jwt.sign(
                { member_id: m_id, username: user.username, role: r_name },
                process.env.SECRET_KEY || 'MIIOT_KEY',
                { expiresIn: '15m' } 
            );

            const refreshToken = crypto.randomBytes(40).toString('hex');
            
            await this.dbCall('sp_adm_token_insert', [
                m_id, refreshToken, req.headers['user-agent'] || 'Unknown Device', req.ip || '127.0.0.1', 7 
            ]);

            await saveLog(req, {
                member_id: m_id,
                action: 'Login',
                table: 'adm_member',
                id: m_id,
                new_data: { login_status: 'success' }
            });

            delete user.password; 
            this.sendResponse(res, { token: accessToken, refreshToken, member: user }, 'Login successful');
        } catch (error) { this.handleError(res, error); }
    };

    // 3. FORGOT PASSWORD (เพิ่มระบบส่งเมลแล้ว!)
    forgotPassword = async (req, res) => {
        const { email } = req.body;
        try {
            if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

            const userCheck = await db.query('SELECT member_id FROM public.adm_member WHERE email = $1', [email]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User with this email not found' });
            }

            const memberId = userCheck.rows[0].member_id;
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 

            const result = await this.dbCall('sp_adm_otp_insert', [memberId, otpCode, 5]);

            if (result && typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(429).json({ success: false, error: result.replace('ERROR: ', '') });
            }

            // 🚩 [ADD] ส่งอีเมลจริงหา User ด้วย OTP ที่เจนได้
            await emailService.sendOTP(email, otpCode);

            await saveLog(req, {
                member_id: memberId,
                action: 'Request_OTP',
                table: 'adm_otp',
                id: memberId,
                new_data: { email: email }
            });

            const otpData = await db.query(
                'SELECT reference FROM public.adm_otp WHERE member_id = $1 ORDER BY created_at DESC LIMIT 1', 
                [memberId]
            );

            // นำ debug_otp ออกในโปรดักชั่นจริง แต่ทิ้งไว้ให้ตองเทสก่อนครับ
            this.sendResponse(res, { debug_otp: otpCode, reference: otpData.rows[0]?.reference || '' }, 'OTP generated and sent to your email.');
        } catch (error) { this.handleError(res, error); }
    };

    // 4. RESET PASSWORD
    resetPassword = async (req, res) => {
        const { email, otp_code, new_password } = req.body;
        try {
            if (!email || !otp_code || !new_password) {
                return res.status(400).json({ success: false, error: 'Email, OTP, and New Password are required' });
            }
            if (new_password.length < 12) {
                return res.status(400).json({ success: false, error: 'New password must be at least 12 characters long' });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            const result = await this.dbCall('sp_adm_member_reset_password_otp', [email, otp_code, hashedPassword]);

            if (result && typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            await saveLog(req, {
                member_id: 'SYSTEM',
                action: 'Rest_Password',
                table: 'adm_member',
                id: email,
                new_data: { status: 'password_updated' }
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    // --- [Data Management] ---
    getMembers = async (req, res) => {
        try {
            const members = await this.dbCall('fn_adm_member_getall', []);
            this.sendResponse(res, { members: members || [] });
        } catch (error) { this.handleError(res, error); }
    };

    getMemberById = async (req, res) => {
        try {
            const member = await this.dbCall('fn_adm_member_getbyid', [req.params.member_id]);
            if (!member) return res.status(404).json({ success: false, error: 'Member not found' });
            delete member.password;
            this.sendResponse(res, { member });
        } catch (error) { this.handleError(res, error); }
    };

    updateMember = async (req, res) => {
        const d = req.body;
        const id = req.params.member_id || d.member_id;
        try {
            const oldMember = await this.dbCall('fn_adm_member_getbyid', [id]);
            const params = [id, d.fname_en, d.lname_en, d.fnameth, d.lnameth, d.position, d.phone, d.is_active];
            const result = await this.dbCall('sp_adm_member_update', params);
            
            await saveLog(req, {
                member_id: req.user?.member_id || id,
                action: 'Update',
                table: 'adm_member',
                id: id,
                old_data: oldMember,
                new_data: d
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    deleteMember = async (req, res) => {
        try {
            const id = req.params.member_id;
            const result = await this.dbCall('sp_adm_member_delete', [id]);
            
            await saveLog(req, {
                member_id: req.user?.member_id || id,
                action: 'Delete',
                table: 'adm_member',
                id: id,
                new_data: { is_active: false }
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    // 5. RESTORE MEMBER (กู้คืนสถานะพนักงาน)
    restoreMember = async (req, res) => {
        try {
            const id = req.params.member_id;
            const result = await this.dbCall('sp_adm_member_restore', [id]);
            
            if (typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            await saveLog(req, {
                member_id: req.user?.member_id || id,
                action: 'Restore',
                table: 'adm_member',
                id: id,
                new_data: { is_active: true }
            });

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    logout = async (req, res) => {
        const { refreshToken } = req.body;
        try {
            if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh Token is required' });
            await saveLog(req, {
                member_id: req.user?.member_id || 'UNKNOWN',
                action: 'Logout',
                table: 'adm_token',
                id: refreshToken.substring(0, 10),
                new_data: { status: 'logged_out' }
            });
            await this.dbCall('sp_adm_token_revoke', [refreshToken]);
            this.sendResponse(res, {}, 'Logged out successfully');
        } catch (error) { this.handleError(res, error); }
    };
    
    refreshToken = async (req, res) => {
        const { refreshToken } = req.body;
        try {
            if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh Token is required' });
            const tokenData = await this.dbCall('fn_adm_token_verify', [refreshToken]);
            if (!tokenData || tokenData.is_revoked) {
                return res.status(401).json({ success: false, error: 'Invalid or Revoked Refresh Token' });
            }
            const newAccessToken = jwt.sign(
                { member_id: tokenData.member_id, username: tokenData.username, role: tokenData.rolename },
                process.env.SECRET_KEY || 'MIIOT_KEY',
                { expiresIn: '15m' }
            );
            await this.dbCall('sp_adm_token_update_usage', [refreshToken]);
            this.sendResponse(res, { token: newAccessToken }, 'Token refreshed');
        } catch (error) { this.handleError(res, error); }
    };
}

module.exports = new MemberController();