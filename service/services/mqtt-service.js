require('dotenv').config({path: './.env'});
const mqtt = require('mqtt');

// ทำเป็น class เพื่อให้สามารถขยายฟังก์ชันการใช้งานได้ในอนาคต
class MqttBroker {
  // host, port, reconnectPeriod สามารถกำหนดได้จาก .env หรือใช้ค่า default
  constructor(host =  process.env.MQTT_HOST, port = process.env.MQTT_PORT, reconnectPeriod = 5000) {
    this.host = host;
    this.port = port;
    this.reconnectPeriod = reconnectPeriod; // milliseconds
    this.client = null;
    this.isConnected = false;
  }

  // ฟังก์ชันนี้จะเชื่อมต่อกับ MQTT broker และคืนค่า client เมื่อเชื่อมต่อสำเร็จ
  // ** อาจจะต้องปรับ logic นิดหน่อยส่วนของช่วง reconnect**
  connect() {
    return new Promise((resolve, reject) => {
      const url = `mqtt://${this.host}:${this.port}`;
      console.log(`[SERVICE] Connecting to ${url} ...`);

      this.client = mqtt.connect(url, {
        reconnectPeriod: this.reconnectPeriod // auto reconnect ทุกๆ 5s
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log(`[SERVICE] Connected to MQTT broker: ${url}`);
        resolve(this.client);
      });

      this.client.on('reconnect', () => {
        console.log(`[SERVICE] Reconnecting to ${url} ...`);
      });

      this.client.on('error', (err) => {
        console.error(`[SERVICE] MQTT error (${url}):`, err.message);
      });

      this.client.on('close', () => {
        console.warn(`[SERVICE] MQTT connection closed: ${url}`);
      });
    });
  }

  // ฟังก์ชันนี้จะคืนค่า client เพื่อให้ส่วนอื่นๆ ของแอปสามารถใช้ได้
  getClient() {
    if (!this.client) throw new Error('MQTT client not connected yet');
    return this.client;
  }

  // ฟังก์ชันนี้จะเช็คว่าการเชื่อมต่อกับ MQTT broker ยังใช้งานได้อยู่หรือไม่
  async healthCheck() {
    // ถ้าต่ออยู่แล้ว
    if (this.isConnected) {
      return true;
    }
    // ถ้ายังไม่เคย connect → ลอง connect
    try {
      await this.connect();
      return this.isConnected;
    } catch (e) {
      return false;
    }
  }
}

module.exports = MqttBroker;