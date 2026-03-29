const express = require('express');
const router = express.Router();
const mem = require('../controller/MemberController');
const auth = require('../lib/authentication');

// --- PUBLIC ROUTES ---
router.post('/login', mem.login);
router.post('/refresh-token', mem.refreshToken);
router.post('/forgot-password', mem.forgotPassword);
router.post('/reset-password', mem.resetPassword);
router.post('/logout', mem.logout);

// --- PRIVATE ROUTES ---
router.use(auth); 

// GET METHOD //
router.get('/getMembers', mem.getMembers); 
router.get('/getMemberById/:member_id', mem.getMemberById); 

// POST METHOD //
router.post('/register', mem.registerMember); 

// PUT METHOD //
router.put('/updateMember', mem.updateMember); 
router.put('/cancelMember/:member_id', mem.deleteMember); 
router.put('/restoreMember/:member_id', mem.restoreMember);

module.exports = router;