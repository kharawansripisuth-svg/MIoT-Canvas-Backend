const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // 1. ดึง Authorization Header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    // 2. ตรวจสอบรูปแบบ "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access denied. No token provided or invalid format.' 
        });
    }

    const token = authHeader.split(' ')[1];

    // 3. ตรวจสอบ Token
    // ใช้ Secret Key จาก .env ถ้าไม่มีให้ใช้ค่าสำรอง (ควรให้ตรงกับใน Controller)
    const secret = process.env.SECRET_KEY || 'MIIOT_SECRET_2026';

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            // แยกประเภท Error เพื่อให้ Debug ง่ายขึ้น
            const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
            return res.status(403).json({ success: false, error: message });
        }

        // 4. ฝากข้อมูล User ไว้กับ Request Object
        // ข้อมูลใน decoded จะมาจากตอนที่เรา jwt.sign ใน Login
        req.user = decoded; 
        
        next();
    });
};