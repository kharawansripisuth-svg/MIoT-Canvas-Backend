import fetch from 'node-fetch';
import fs from 'fs';

const SERVER_URL = 'http://localhost:3000/api';
const DEVICE_ID = 'sensor001';
const DEVICE_NAME = 'Temperature Sensor Living Room';
const LOCATION = 'Living Room';
const MODEL = 'DHT22';
const CONFIG_FILE = './deviceConfig.json';

async function registerDevice() {
    console.log('[DEVICE] Registering device...');
    const res = await fetch(`${SERVER_URL}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            deviceId: DEVICE_ID,
            name: DEVICE_NAME,
            location: LOCATION,
            model: MODEL
        })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data.credentials));
    console.log('[DEVICE] Registered:', data.credentials);
    return data.credentials;
}

async function sendData(credentials) {
    const payload = {
        temp: +(20 + Math.random() * 10).toFixed(2),
        humidity: +(30 + Math.random() * 20).toFixed(2),
        timestamp: new Date().toISOString()
    };
    console.log('[DEVICE] Sending:', payload);

    const res = await fetch(`${SERVER_URL}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            deviceId: credentials.deviceId,
            apiKey: credentials.apiKey,
            payload
        })
    });
    console.log(await res.json());
}

(async () => {
    let credentials;
    if (fs.existsSync(CONFIG_FILE)) {
        credentials = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } else {
        credentials = await registerDevice();
    }
    setInterval(() => sendData(credentials), 5000);
})();