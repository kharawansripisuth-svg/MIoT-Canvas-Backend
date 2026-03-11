require('dotenv').config({path: './.env'});
const { Pool } = require('pg');
const MqttBroker = require('./mqtt-service');
const Newid = require('../../api/lib/Newid');
const Service = require('../../api/models/PostgreSQL/Service');

//เรียก sql จาก model ในส่วนของ service
const service = new Service();

// ทำหน้าที่เป็น Cache file เก็บ topic ที่มีอยู่ในดาต้าเบส
const knownTopics = new Set();

//ทำเป็น class เพื่อที่จะเพิ่มฟังก์ชั่นในอนาคต
class PostgresService {
  constructor() {
    this.pool = new Pool({
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      user: process.env.PG_USER || 'postgres',
      password: process.env.PG_PASS || '1234',
      database: process.env.PG_DB || 'Test',
    });
  }
  // ทำการเชื่อมต่อกับ Postgres
  async connect() {
    return this.pool.connect();
  }
  // ทำการ query
  async query(sql, params) {
    return this.pool.query(sql, params);
  }
  // เช็คว่ามี Table adm_topic หรือไม่
  // อาจจะไม่ต้องมีส่วนนี้ก้ได้ลองไปพิจารณาดู
  async ensureTable() {
    await this.query(`
      CREATE TABLE IF NOT EXISTS adm_topic (
        topic_id CHAR(8) PRIMARY KEY,
        topic_name TEXT UNIQUE NOT NULL
      )
    `);
  }
}

//ทำเป็น class เพื่อที่จะเพิ่มฟังก์ชั่นในอนาคต
class TopicService {
  // เชื่อมต่อกับ Postgres MQTT BRoker และเรียกใช้ Lib Newid
  // อาจจะเปลี่ยนอัลกอริทึมในการใส่ไอดีใหม่โดยที่ไม่ต้องเรียกใช้ newid
  constructor() {
    this.db = new PostgresService();
    this.mqtt = new MqttBroker();
    this.newid = new Newid();
  }
  // เริ่มการทำงาน
  async start() {
    // ทำการเชื่อมต่อ
    await this.db.connect();
    // เช็คว่ามี table หรือไม่
    await this.db.ensureTable();
    // เรียกใช้การ sync กับ database ใน cache file
    await this.syncCacheFromDb();

    // เชื่อมต่อกับ MQTT Broker Client
    const mqttClient = await this.mqtt.connect();
    // subscribe #
    mqttClient.subscribe('#');
    //  ดูว่า message ที่ส่งไปมี topic กับ message อะไรมา
    mqttClient.on('message', async (topic, message) => {
      //// console.log(`[MQTT] ${topic} => ${message.toString()}`);
      
      // เรียกฟังก์ชั่น saveTopic จาก topic ที่ส่งมาที่ client
      await this.saveTopic(topic);
    });
  }

  // ฟังก์ชั่น ซิงค์ดาต้าเบสด้วย cache dile
  async syncCacheFromDb() {
  try {
    const rows = await service.syncCache(); 
    knownTopics.clear();

    rows.forEach(row => {
      knownTopics.add(row.topic_name);
    });
      console.log(`[Cache] Synced ${knownTopics.size} topics from database.`);
    } catch (err) {
      console.error('[Cache] Sync Error:', err);
    }
  }

  // ฟังก์ชั่นบันทึก Topic
  async saveTopic(topic) {
    if (knownTopics.has(topic)) return;
    try {
      const id = await this.newid.genTopicId();

      // save topic ลง table 
      await service.saveTopic(id, topic);
      //เพิ่ม topic ลง cache ที่เป็นในรูปแบบ Set
      knownTopics.add(topic);
      console.log(`[DB] Saved: ${topic} (ID: ${id})`);
    } catch (err) {
      console.error('[DB] Error saving topic:', err);
    }
  }

  refreshCache() {
    this.syncCacheFromDb();
  }
}

module.exports = TopicService;