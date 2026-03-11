require('dotenv').config({path: './.env'});
const { InfluxDB } = require('influx');

// ทำเป็น class เพื่อให้สามารถขยายฟังก์ชันการใช้งานได้ในอนาคต
class InfluxService {
  constructor() {
    // ตรวจสอบว่ามี env ที่จำเป็นครบถ้วนก่อนสร้าง client
    // ใน อาร์เรย์ requiredEnv ใคือชื่อใน .env ที่ต้องมี
    const requiredEnv = ['INFLUX_HOST', 'INFLUX_PORT', 'INFLUX_DB', 'INFLUX_USER', 'INFLUX_PASS'];
    requiredEnv.forEach((key) => {
      // ถ้าไม่มีตัวใดตัวหนึ่งใน requiredEnv จะโยน error ออกมาเลย
      if (!process.env[key]) {
        throw new Error(`Missing env variable: ${key}`);
      }
    });

    // สร้าง InfluxDB client ด้วยค่าจาก .env
    this.client = new InfluxDB({
      host: process.env.INFLUX_HOST,
      port: Number(process.env.INFLUX_PORT),
      database: process.env.INFLUX_DB,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_PASS,
    });

    // สถานะการเชื่อมต่อ (จะเช็คจริงๆ ในฟังก์ชัน healthCheck)
    this.isConnected = false;
  }

  // ฟังก์ชันนี้จะคืนค่า client เพื่อให้ส่วนอื่นๆ ของแอปสามารถใช้ได้
  getClient() {
    return this.client;
  }
  
  // ฟังก์ชันนี้จะเช็คว่าการเชื่อมต่อกับ InfluxDB ยังใช้งานได้อยู่หรือไม่
  // ** อาจจะต้องปรับ logic **
  /*
  healthCheck() {
    try {
      this.client.getDatabaseNames(); 
      this.isConnected = true;
      return true;
    } catch (e) {
      console.error('[SERVICE] InfluxDB health check error:', e.message);
      this.isConnected = false;
      return false;
    }
  }*/
}

module.exports = new InfluxService();