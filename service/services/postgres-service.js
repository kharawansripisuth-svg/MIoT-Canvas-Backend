require('dotenv').config({path: './.env'});
const { Pool } = require('pg');

class PostgresService {
    // เป็นที่เก็บการเชื่อมต่อที่ดึงจาก env
    constructor() {
        this.pool = new Pool({
            host: process.env.PG_HOST,
            port: Number(process.env.PG_PORT),
            database: process.env.PG_DB,
            user: process.env.PG_USER,
            password: process.env.PG_PASS,
        });
    }
    // เชื่อมต่อกับ postgres client
    async connect() {
        const client = await this.pool.connect();
        client.release();
        console.log('[DB] Connected to Postgres');
    }
    // ฟังก์ชั่นเรียกใช้ query
    async query(sql, params) {
        // รอเชื่อมต่อกับ client ก่อน
        const client = await this.pool.connect();
        try {
            const res = await client.query(sql, params);
            return res;
        } finally {
            client.release();
        }
    }
}

module.exports = PostgresService;