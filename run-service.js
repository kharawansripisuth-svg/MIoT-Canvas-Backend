const TopicService = require('./service/services/topic-dis');
//// const pg = require('./service/postgres-service');
const genConfig = require('./service/services/write-config');

const getMeas = require('./service/services/payload-service');

//เรียก api ทุก route
const api = require('./api/App');

//เรียก port พื้นฐานจาก .env มาใช้ในการรันเซิร์ฟเวอร์ API
const PORT = process.env.PORT;;

// เรียกฟังก์ชันให้ทำงาน
(async () => {
  //เรียกการใช้งาน TopicService
    const topicService = new TopicService();
    // รอให้ เชื่อมต่อกับ Postgres, เช็คว่ามีตาราง adm_topic ไหม ถ้าไม่มีให้สร้าง และดึงข้อมูลในตารางมาเก็บไว้ใน cache
    await topicService.start();
    
    //เรียกการใช้งาน PayloadServiceทำการบันทึก field พร้อม device_id จาก topic ที่ได้รับมา ก็คือ #(ทุก topic wild card)
    ////const measurementService = new getMeas("#"); ไม่แน่ใจว่าจะซ้ำซ้อนไปหรือเปล่า เพราะใน ฟังก์ชั่นสั่งให้ subscribe # อยู่แล้ว
    const measurementService = new getMeas();
    await measurementService.start();
    // เรียกการใช้งาน genConfig เพื่อสร้างไฟล์ telegraf.conf
    await genConfig();
})();

api.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
