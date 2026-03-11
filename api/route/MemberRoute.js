const express = require('express');
const router = express.Router();
const mem = require('../controller/MemberController');
const auth = require('../lib/authentication');

// --- PUBLIC ROUTES ---
// พวกนี้ไม่ต้องใช้ Access Token (เพราะ User ยังเข้าระบบไม่ได้ หรือลืมรหัส)
router.post('/register', mem.registerMember);
router.post('/login', mem.login);
router.post('/refresh-token', mem.refreshToken);
router.post('/forgot-password', mem.forgotPassword); // Step 1: ขอ OTP 6 หลัก
router.post('/reset-password', mem.resetPassword);   // Step 2: ส่ง OTP + รหัสใหม่ (12 ตัว)
router.post('/logout', mem.logout); 

// --- PRIVATE ROUTES พวกนี้ต้องผ่านการ Auth ก่อน ---
router.use(auth); 

// ดึงข้อมูลสมาชิก (Read)
router.get('/', mem.getMembers);            // GET: /api/member/
router.get('/:member_id', mem.getMemberById); // GET: /api/member/M0000001

// แก้ไขข้อมูลสมาชิก (Update)
router.put('/:member_id', mem.updateMember);  // PUT: /api/member/M0000001

// ลบการใช้งานสมาชิก (Delete)
router.delete('/:member_id', mem.deleteMember); // DELETE: /api/member/M0000001

module.exports = router;