require('dotenv').config({ path: './.env' });
const Newid = require('../../api/lib/Newid');
const PostgresService = require('./postgres-service');
const MqttBroker = require('./mqtt-service');

class PayloadService {
  constructor() {
    this.db = new PostgresService();
    this.mqtt = new MqttBroker();
    this.newid = new Newid();
  }

  // หา device_id ตาม topic
  async getDeviceIdFromTopic(topic) {
    const res = await this.db.query(
      `SELECT device_id 
       FROM adm_device AS d 
       INNER JOIN adm_topic AS t ON d.topic_id = t.topic_id 
       WHERE t.topic_name = $1`,
      [topic]
    );
    return res.rows.length ? res.rows[0].device_id : null;
  }

  // เริ่ม process การทำงานของ service
  async start() {
    await this.db.connect();
    const client = await this.mqtt.connect();
    
    client.subscribe('#');
    console.log('--- Payload Service Started (Using Stored Procedure) ---');

    client.on('message', async (topic, message) => {
      try {
        // 1. ตรวจสอบ Device ID จาก Topic
        const deviceId = await this.getDeviceIdFromTopic(topic);
        if (!deviceId) {
          console.warn(`[Unknown Topic]: ${topic}`);
          return;
        }

        const payload = JSON.parse(message.toString());

        // 2. ดึงรายการ Skip Tags (เช่น device_name) เพื่อไม่นำมาบันทึกเป็น Measurement
        const skipTagResult = await this.db.query(`SELECT DISTINCT device_name FROM adm_device WHERE is_active = true`);
        const skipTags = skipTagResult.rows.map(row => row.device_name);

        // 3. วนลูปจัดการทุกฟิลด์ใน Payload
        for (const fieldName of Object.keys(payload)) {
          // ข้ามฟิลด์ที่ไม่ใช่ค่าจากเซนเซอร์
          if (fieldName === 'device_id' || skipTags.includes(fieldName)) {
            continue;
          }

          // สร้าง ID ใหม่เผื่อไว้กรณีต้อง Insert (ถึงไม่ได้ใช้ SP ก็จะจัดการข้ามให้เองถ้าซ้ำ)
          const measId = await this.newid.genMeasId(deviceId);

          // 4. เรียกใช้ Stored Procedure ตัวเดียวจบ (Update Status + Save Measurement)
          await this.db.query(
            `CALL sp_adm_process_payload($1, $2, $3)`,
            [deviceId, fieldName, measId]
          );
        }

        console.log(`[Processed]: Topic ${topic} | Device ${deviceId}`);

      } catch (err) {
        console.error("Critical Error in Payload Processing:", err);
      }
    });
  }
}

module.exports = PayloadService;