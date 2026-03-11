// require('dotenv').config({path: '../../.env'});
const pgService = require('../../service/services/postgres-service');
const db = new pgService();

class Newid {
    async genDeviceId() {
        await db.connect();
        console.log('Database is connected');
        try {
            const lastIdResult = await db.query(
                `SELECT MAX(CAST(device_id AS INTEGER)) AS max_id FROM adm_device`
            );

            let newDeviceId;
            if (!lastIdResult.rows[0].max_id) {
                // ถ้าไม่มีข้อมูลเลย
                newDeviceId = '00000001';
            } else {
                // ถ้ามี → บวกขึ้น 1
                const lastIdNum = parseInt(lastIdResult.rows[0].max_id, 10);
                newDeviceId = String(lastIdNum + 1).padStart(8, '0');
            }

            return newDeviceId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }
    async genMeasId(deviceId) {
        await db.connect();
        try {
            const lastMeasResult = await db.query(
                `SELECT MAX(CAST(meas_id AS INTEGER)) AS max_id 
                 FROM adm_devicemeasurement 
                 WHERE device_id = $1`,
                [deviceId]
            );
            let newMeasId;
            if (!lastMeasResult.rows[0].max_id) {
                // ถ้าไม่มี meas_id เลย → เริ่ม 0001
                newMeasId = '0001';
            } else {
                // ถ้ามี → บวกขึ้น 1 และ format เป็น 4 หลัก
                const lastIdNum = parseInt(lastMeasResult.rows[0].max_id, 10);
                newMeasId = String(lastIdNum + 1).padStart(4, '0');
            }
            return newMeasId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }
    async genTopicId() {
        await db.connect();
        try {
            const lastTopicResult = await db.query(
                `SELECT MAX(topic_id) AS max_id FROM adm_topic`,
            );
            let newTopicId;
            if (!lastTopicResult.rows[0].max_id) {

                newTopicId = '00000001';
            } else {

                const lastIdNum = parseInt(lastTopicResult.rows[0].max_id, 10);
                newTopicId = String(lastIdNum + 1).padStart(8, '0');
            }
            return newTopicId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }

    async genCustomerId() {
        await db.connect();
        console.log('Database is connected');
        try {
            const lastCustomerResult = await db.query(
                `SELECT MAX(customer_id) AS max_id FROM adm_customer`,
            );
            let newCustomerId;
            if (!lastCustomerResult.rows[0].max_id) {

                newCustomerId = '00000001';
            } else {

                const lastIdNum = parseInt(lastCustomerResult.rows[0].max_id, 10);
                newCustomerId = String(lastIdNum + 1).padStart(8, '0');
            }
            return newCustomerId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }

    async genMemberId() {
        await db.connect();
        console.log('Database is connected');
        try {
            const lastMemberResult = await db.query(
                `SELECT MAX(member_id) AS max_id FROM adm_member`,
            );
            let newMemberId;
            if (!lastMemberResult.rows[0].max_id) {

                newMemberId = '00000001';
            } else {

                const lastIdNum = parseInt(lastMemberResult.rows[0].max_id, 10);
                newMemberId = String(lastIdNum + 1).padStart(8, '0');
            }
            return newMemberId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }

    async genBrokerId() {
        await db.connect();
        console.log('Database is connected');
        try {
            const lastBrokerResult = await db.query(
                `SELECT MAX(broker_id) AS max_id FROM adm_broker`,
            );
            let newBrokerId;
            if (!lastBrokerResult.rows[0].max_id) {

                newBrokerId = '0001';
            } else {

                const lastIdNum = parseInt(lastBrokerResult.rows[0].max_id, 10);
                newBrokerId = String(lastIdNum + 1).padStart(4, '0');
            }
            return newBrokerId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }

    async genVendorId() {
        await db.connect();
        console.log('Database is connected');
        try {
            const lastVendorResult = await db.query(
                `SELECT MAX(vendor_id) AS max_id FROM adm_vendor`,
            );
            let newVendorId;
            if (!lastVendorResult.rows[0].max_id) {

                newVendorId = '00000001';
            } else {

                const lastIdNum = parseInt(lastVendorResult.rows[0].max_id, 10);
                newVendorId = String(lastIdNum + 1).padStart(8, '0');
            }
            return newVendorId;
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            await db.close?.();
        }
    }
    // new method in the future go down here
    // async genTopicId() {
    // etc.
}

module.exports = Newid;