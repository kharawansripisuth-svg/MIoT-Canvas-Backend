require('dotenv').config({ path: './.env' });
const Service = require('../../api/models/PostgreSQL/Service');
const service = new Service();
const path = require('path');
const fs = require('fs');

// เรียก path ที่เก็บ telegraf config file
const CONFIG_PATH = process.env.CONFIG_PATH;
if (!CONFIG_PATH) throw new Error('CONFIG_PATH env is not set');

// สร้างโฟลเดอร์ CONFIG_PATH ถ้ายังไม่มี
// อาจจะไม่ต้องมีส่วนนี้
/*
if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(CONFIG_PATH, { recursive: true });
    console.log(`[INIT] Created CONFIG_PATH directory: ${CONFIG_PATH}`);
}
*/

// ดึงข้อมูล device ที่ใช้
// ไปดูใน fn ใน pg ดูอีกทีเพื่อความชัวร์ว่าใช้ทำอะไรในส่วนนี้
async function fetchDevices() {
    try {
        return await service.fetchDevice();
    } catch (err) {
        console.error('[ERROR] fetchDevices:', err);
        return [];
    }
}

function backupConfig(filePath) {
    if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.bak';
        fs.copyFileSync(filePath, backupPath);
        console.log(`[BACKUP] ${filePath} → ${backupPath}`);
    }
}

// block ที่ควรมีใน telegraf config file เป็นส่วนที่ขาดไม่ได้
function ensureCustomerBaseConfig(customerCode, customerName) {
    const filePath = path.join(CONFIG_PATH, `config_${customerCode}.conf`);
    if (!fs.existsSync(filePath)) {
        const baseConfig = `# Telegraf Configuration for ${customerName}
[agent]
interval = "10s"
round_interval = true
metric_batch_size = 1000
metric_buffer_limit = 10000
flush_interval = "10s"
flush_jitter = "0s"

[[outputs.influxdb]]
urls = ["http://localhost:8086"]
database = "${customerCode}"
skip_database_creation = false
timeout = "5s"
`;
        fs.writeFileSync(filePath, baseConfig, 'utf8');
        console.log(`[INIT] Created base config for ${customerCode}`);
    }
}

//ฟังก์ชั่นนี้จะทำการเขียนส่วนประกอบของ telegraf coonfig file
//โดยถ้า topic เดิมมีการเปลี่ยนแปลงข้อมูลข้างในก็จะไม่เขียนทับไฟล์ แต่จะเป็นการแก้ไขในส่วนนั้นแทน
// ถ้ามี topic ใหม่ใน config จะทำการต่อที่บรรทัดสุดท้าย
function updateOrAppendDeviceConfig(customerCode, device) {
    const filePath = path.join(CONFIG_PATH, `config_${customerCode}.conf`);
    let content = fs.readFileSync(filePath, 'utf8');

    const topicPattern = new RegExp(
        `# TOPIC_ID: ${device.topic_id}[\\s\\S]*?name_override = "${device.device_name}"`,
        'gm'
    );

    // tag_key = device.device_model
    //device_name = tag_value
    // device_label = ชื่อเล่นที่เปลี่ยนได้ตามที่ต้องการ ลดการเกิด conflict ตอนที่ database 1 เปลี่ยนแปลง กัน service ระเบิด 

    const newBlock = `
# TOPIC_ID: ${device.topic_id}
[[inputs.mqtt_consumer]]
servers = ["tcp://${device.broker_host}:${device.broker_port}"]
topics = ["${device.topic_name}"]
qos = 0
connection_timeout = "30s"
data_format = "json"
tag_keys = ["${device.device_name}"]
name_override = "${device.device_name}"
`.trim();


    // backup ก่อนแก้
    backupConfig(filePath);

    if (topicPattern.test(content)) {
        // อัปเดตเฉพาะเมื่อเนื้อหาใน block ไม่ตรงกับ newBlock
        const existingBlockMatch = content.match(topicPattern);
        if (!existingBlockMatch || existingBlockMatch[0] !== newBlock) {
            content = content.replace(topicPattern, newBlock);
            console.log(`[UPDATE] Updated block for topic_id ${device.topic_id} in ${customerCode}`);
        } else {
            console.log(`[SKIP] No changes for topic_id ${device.topic_id}`);
        }
    } else {
        // เพิ่ม block ใหม่
        content += '\n' + newBlock;
        console.log(`[APPEND] Added new block for topic_id ${device.topic_id} in ${customerCode}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

async function updateTelegrafConfigs() {
    try {
        const devices = await fetchDevices();
        if (!devices || devices.length === 0) {
            console.log('[INFO] No active devices found.');
            return;
        }

        // จัดกลุ่ม devices ตาม customer_code
        //แยกไฟล์ config ตาม ชื่อของ customer
        const customerMap = {};
        for (const dev of devices) {
            const custCode = dev.customer_code || `UNKNOWN_${dev.customer_id}`;
            const custName = dev.customer_name || 'Unknown Customer';
            if (!customerMap[custCode]) {
                customerMap[custCode] = {
                    customerName: custName,
                    devices: []
                };
            }
            customerMap[custCode].devices.push(dev);
        }

        // loop ลูกค้าแต่ละคน
        for (const [custCode, custData] of Object.entries(customerMap)) {
            ensureCustomerBaseConfig(custCode, custData.customerName);
            for (const dev of custData.devices) {
                updateOrAppendDeviceConfig(custCode, dev);
            }
        }

        console.log('[DONE] Config update cycle completed.');
    } catch (err) {
        console.error('[ERROR] updateTelegrafConfigs:', err);
    }
}

// ตั้งให้ตรวจสอบและอัปเดตทุก 10 วินาที
setInterval(updateTelegrafConfigs, 10 * 1000);

module.exports = updateTelegrafConfigs;