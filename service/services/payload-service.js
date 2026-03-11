require('dotenv').config({ path: './.env' });
const Newid = require('../../api/lib/Newid');
const PostgresService = require('./postgres-service');
const MqttBroker = require('./mqtt-service');

// ทำเป็น class เพื่อให้สามารถขยายฟังก์ชันการใช้งานได้ในอนาคต
class PayloadService {
  //เรียกใช้ PostgresService, MqttBroker และ Newid ใน constructor เพื่อให้สามารถใช้งานได้ในฟังก์ชันอื่นๆ ของ class นี้
  constructor() {
    this.db = new PostgresService();
    this.mqtt = new MqttBroker();
    this.newid = new Newid();
  }

  // หา device_id ตาม topic
  async getDeviceIdFromTopic(topic) {
    // นำ sql ไปเป็นฟังกืชั่นและเรียกใชช้ผผ่าน Model
    const res = await this.db.query(
      `SELECT device_id 
       FROM adm_device AS d 
       INNER JOIN adm_topic AS t ON d.topic_id = t.topic_id 
       WHERE t.topic_name = $1`,
      [topic]
    );
    // ถ้าเจอ device_id จะคืนค่า ถ้าไม่เจอจะคืน null 
    // ถ้าทำเป็นฟังก์ชั่นแล้ว res.rows[0] จะต้องเปลี่ยนเป็นชื่อตัวแปร เพราะใน model คืนค่าเป็น res.rows[0]อยู่แล้ว
    return res.rows.length ? res.rows[0].device_id : null;
  }

  // บันทึก field พร้อม device_id
async saveField(deviceId, measurementName) {

  // เช็คก่อนว่ามี device_id + measurementname นี้อยู่แล้วหรือไม่ ถ้ามีแล้วจะไม่บันทึกซ้ำ
  const check = await this.db.query(`
    SELECT 1 
    FROM adm_devicemeasurement 
    WHERE device_id = $1 AND measurementname = $2
    LIMIT 1
  `, [deviceId, measurementName]);

  if (check.rows.length > 0) {
    console.log(`Duplicate found, skip: device_id=${deviceId} | measurementname=${measurementName}`);
    return; 
  }
  // เรียกใช้ newid จาก library เพื่อสร้าง meas_id ใหม่ และบันทึกข้อมูลลงฐานข้อมูล
  // ถ้าดูใน database เห็นได้ว่าบางคอลัมไม่ได้เป็น id 8 digit เพราะว่าใส่ไปก่อนสร้าง library นี้
  const measId = await this.newid.genMeasId(deviceId);

  // บันทึก measurement ใหม่ที่ไม่เคยมีของ device นั้น
  await this.db.query(`
    INSERT INTO adm_devicemeasurement (device_id, meas_id, measurementname,is_active)
    VALUES ($1, $2, $3, true)
  `, // สิ่งนี้เรียกว่าการ blind parameter
  [deviceId, measId, measurementName]);

  console.log(`Saved: device_id=${deviceId} | meas_id=${measId} | measurementname=${measurementName}`);
}
  // เริ่ม process การทำงานของ service
  async start() {
    await this.db.connect();
    //เรียก mqtt จาก mqtt-service
    const client = await this.mqtt.connect();
    // subscribe # ถ้าโค้ดทำงานไม่ได้ไปปลดคอมเม้นที่ run-service.js แล้วแก้ไขให้ถูกต้อง
    client.subscribe('#');
    console.log('Subscribe to all topics (#)');

    // ดักฟัง ข้อความ หรือ payload ที่ได้รับมา โดยพารามิเตอร์ที่รับมาในส่วนนี้คือต้องรับ topic, message ที่พ่วงมากับ topic
    client.on('message', async (topic, message) => {
      try {
        //เรียก device_id จาก topic ที่รับมา
        const deviceId = await this.getDeviceIdFromTopic(topic);
        //ถ้าไม่ได้รับ device_id แสดงว่า topicนั้นยังไม่เคยถูกใช้งานเพราะไม่มี device_id ให้เชื่อมความสัมพันธ์กับ topic_id
        if (!deviceId) {
          console.warn(`Device not found for topic: ${topic}`);
          return;
        }

        //แปลงJSON ให้เป็น String
        const payload = JSON.parse(message.toString());
        // ดึงรายชื่ออุปกรณ์ที่ไม่ซ้ำกัน (DISTINCT) จากตาราง adm_device เพื่อใช้เป็นรายการยกเว้น
        const skipTagResult = await this.db.query(`SELECT DISTINCT device_name FROM adm_device`);
        //แปลงผลลัพธ์จากฐานข้อมูล (Array of Objects) ให้กลายเป็น Array ของข้อความ (String)
        const skipTags = skipTagResult.rows.map(row => row.device_name);
        //วนลูปตรวจสอบทุกๆ key (ชื่อฟิลด์) ที่อยู่ใน payload ที่ส่งมา
        for (const fieldName of Object.keys(payload)) {
        //ตรวจสอบว่าถ้าชื่อฟิลด์คือ 'device_id' หรืออยู่ในรายการยกเว้น (skipTags) ให้ข้ามฟิลด์นี้ไป ไม่ต้องทำอะไรต่อ
        if (fieldName === 'device_id' || skipTags.includes(fieldName)) {
            continue;
        }
        //บันทึกฟิลด์ โดยใช้ device_id และ ชื่อฟิลด์
        await this.saveField(deviceId, fieldName);
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    });
  }
}

module.exports = PayloadService;