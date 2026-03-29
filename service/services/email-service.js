const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'testmiotcanvas@gmail.com', //เมลเราที่ไว้ใช้ส่ง
                pass: 'vhpqyqutpiasftqt' //รหัส 16 หลัก 
            }
        });
    }

    async sendOTP(targetEmail, otpCode) {
        try {
            const mailOptions = {
                from: '"My System Admin" <testmiotcanvas@gmail.com>', // ชื่อผู้ส่ง
                to: targetEmail, 
                subject: 'รหัสยืนยัน OTP สำหรับเปลี่ยนรหัสผ่าน',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #007bff;">รหัสยืนยัน (OTP) ของคุณ</h2>
                        <p>กรุณาใช้รหัสผ่านด้านล่างนี้เพื่อยืนยันการเปลี่ยนรหัสผ่านของคุณ:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; margin: 20px 0;">
                            ${otpCode}
                        </div>
                        <p style="color: #666; font-size: 12px;">รหัสนี้จะหมดอายุภายใน 5 นาที</p>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return { success: true };
        } catch (error) {
            console.error('Email Error:', error);
            throw new Error('ไม่สามารถส่งอีเมลได้');
        }
    }
}

module.exports = new EmailService();