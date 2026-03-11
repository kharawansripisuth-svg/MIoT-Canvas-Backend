require('dotenv').config();
const pgService = require('../../service/services/postgres-service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const db = new pgService();

class MemberController {
    
    // --- Helpers ---
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
            const sql = `SELECT * FROM public.${funcName}(${placeholders})`;
            const result = await db.query(sql, params);
            
            if (!result || result.rows.length === 0) return null;
            if (funcName.includes('getall')) return result.rows;
            
            return result.rows[0][funcName] !== undefined ? result.rows[0][funcName] : result.rows[0];
        } catch (error) {
            throw error;
        } finally {
            if (db.close) await db.close();
        }
    };

    // --- Main Functions ---

    // 1. REGISTER (บังคับรหัสผ่าน 12 ตัว)
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
            const customer = await db.query(`SELECT customer_id FROM adm_customer WHERE customer_code = $1`, [d.department]);
            if (!customer.rows.length) return res.status(404).json({ success: false, error: 'Department not found' });

            const params = [
                null, customer.rows[0].customer_id, d.role || '1', d.username,
                d.fname_en, d.lname_en, d.fnameth, d.lnameth, hashedPassword,
                d.email, d.position || '', d.phone, req.user?.member_id || 'M0000001'
            ];

            const result = await this.dbCall('fn_adm_member_insert', params);
            if (typeof result === 'string' && result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            this.sendResponse(res, { member_id: result }, 'Registered successfully', 201);
        } catch (error) { this.handleError(res, error); }
    };

    // 2. LOGIN
    login = async (req, res) => {
        const { email, username, password } = req.body;
        const identity = username || email;
        try {
            const user = await this.dbCall('fn_adm_member_login', [identity, null]);
            if (!user || !(await bcrypt.compare(password, user.password.trim()))) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const accessToken = jwt.sign(
                { member_id: user.memberid, username: user.username, role: user.rolename },
                process.env.SECRET_KEY || 'MIIOT_KEY',
                { expiresIn: '15m' } 
            );

            const refreshToken = crypto.randomBytes(40).toString('hex');
            await this.dbCall('fn_adm_token_insert', [
                user.memberid, refreshToken, req.headers['user-agent'] || 'Unknown Device', req.ip || '127.0.0.1', 7 
            ]);

            delete user.password;
            this.sendResponse(res, { token: accessToken, refreshToken, member: user }, 'Login successful');
        } catch (error) { this.handleError(res, error); }
    };

    // 4. FORGOT PASSWORD (OTP 6 Digits + Reference)
    forgotPassword = async (req, res) => {
        const { email } = req.body;
        try {
            if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

            await db.connect();
            const userCheck = await db.query('SELECT member_id FROM public.adm_member WHERE email = $1', [email]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User with this email not found' });
            }

            const memberId = userCheck.rows[0].member_id;
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // เรียกใช้ Function บันทึก OTP (Function นี้จะเจน ID และ Reference ให้อัตโนมัติ)
            await this.dbCall('fn_adm_otp_insert', [memberId, otpCode, 5]);

            // ดึงค่า Reference ล่าสุดออกมาส่งให้หน้าบ้าน
            const otpData = await db.query(
                'SELECT reference FROM public.adm_otp WHERE member_id = $1 ORDER BY otp_id DESC LIMIT 1', 
                [memberId]
            );

            this.sendResponse(res, { 
                debug_otp: otpCode,
                reference: otpData.rows[0]?.reference || '' 
            }, 'OTP generated successfully. Please check your email.');

        } catch (error) { this.handleError(res, error); }
    };

    // 5. RESET PASSWORD (ตรวจสอบ OTP และ Password 12 ตัว)
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
            const result = await this.dbCall('fn_adm_member_reset_password_otp', [email, otp_code, hashedPassword]);

            if (result.startsWith('ERROR')) {
                return res.status(400).json({ success: false, error: result });
            }

            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    // --- ส่วนดึงข้อมูลและจัดการสมาชิกอื่นๆ (GET, UPDATE, DELETE) ---
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
            const params = [id, d.fname_en, d.lname_en, d.fnameth, d.lnameth, d.position, d.phone, d.is_active];
            const result = await this.dbCall('fn_adm_member_update', params);
            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    deleteMember = async (req, res) => {
        try {
            const result = await this.dbCall('fn_adm_member_delete', [req.params.member_id]);
            this.sendResponse(res, {}, result);
        } catch (error) { this.handleError(res, error); }
    };

    logout = async (req, res) => {
        const { refreshToken } = req.body;
        try {
            if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh Token is required' });
            await this.dbCall('fn_adm_token_revoke', [refreshToken]);
            this.sendResponse(res, {}, 'Logged out successfully');
        } catch (error) { this.handleError(res, error); }
    };
    
    // 3. REFRESH TOKEN 
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
            await this.dbCall('fn_adm_token_update_usage', [refreshToken]);
            this.sendResponse(res, { token: newAccessToken }, 'Token refreshed');
        } catch (error) { this.handleError(res, error); }
    };
}

module.exports = new MemberController();