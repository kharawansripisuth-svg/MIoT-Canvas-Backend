const PostgresService = require('../../service/services/postgres-service');
const Measurement = require('../models/PostgreSQL/Measurement');
const InfluxQuery = require('../models/InfluxDB/influx-realtime-byid');
const GetId = require('../lib/GetDeviceId');

const db = new PostgresService();
const measurement = new Measurement();
const influx = new InfluxQuery();
const getId = new GetId();

class MeasurementController { 

    /**
     * ดึงข้อมูลสรุปสถานะอุปกรณ์สำหรับการ์ด 4 ใบ
     */
    async getDeviceSummary(req, res) {
        await db.connect();
        try {
            const result = await measurement.getDeviceStatusSummary();
            
            if (!result) {
                return res.status(404).json({ error: 'Summary data not found' });
            }

            return res.status(200).json({
                message: 'Device status summary retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    /**
     * ดึงข้อมูลรายการการวัด (รองรับ Filter: customer_id, zone_id, search)
     * หากไม่ส่งค่ามา จะดึงข้อมูลทั้งหมด
     */
    async getMeasurement(req, res) {
        await db.connect();
        try {
            const { customer_id, zone_id, search } = req.query;

            //ส่ง parameter เพิ่มเพื่อดึงเฉพาะตัวที่ is_active = true (ยังไม่ถูกลบ)
            const result = await measurement.getMeasurementFilter(customer_id, zone_id, search, true);
            
            if (!result || result.length === 0) {
                return res.status(404).json({ error: 'No measurements found' });
            }

            return res.status(200).json({
                message: 'Show measurements successfully',
                count: result.length,
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getMeasurementById(req, res) {
        await db.connect();
        try {
            const measurement_id = req.params.id;
            if (!measurement_id) {
                return res.status(400).json({ error: 'Measurement ID is required' });
            }

            const result = await measurement.getMeasurementById(measurement_id);
            if (!result || result.length === 0) {
                return res.status(404).json({ error: 'Measurement not found' });
            }

            return res.status(200).json({
                message: 'Show measurement by ID successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getRealtime(req, res) {
        await db.connect();
        try {
            const { device_id, device_name, device_label, customer_code } = req.query;

            if (!device_id && !device_name && !device_label && !customer_code) {
                return res.status(400).json({ error: 'At least one device identifier is required' });
            }

            // 1. ดึงข้อมูล Config จาก Postgres
            const resultpg = await measurement.getRealtime(device_id, device_name, device_label, customer_code);

            if (!resultpg) {
                return res.status(404).json({ error: 'No device found' });
            }

            const { measurement_list, unit_list, device_label: label, device_name: name, customer_code: code } = resultpg;

            // 2. สร้าง Mapping ระหว่าง Measurement กับ Unit
            const measureArray = measurement_list.split(',').map(item => item.trim());
            const unitArray = unit_list ? unit_list.split(',').map(item => item.trim()) : [];
            
            const unitMap = {};
            measureArray.forEach((measure, index) => {
                unitMap[measure] = unitArray[index] || '';
            });

            // 3. ดึงข้อมูลจาก InfluxDB
            const resultinflux = await influx.realtimeInflux(measurement_list, name, label, code);
            
            // 4. ประกอบข้อมูลพร้อมหน่วย (Unit)
            const dataWithUnits = resultinflux.map(row => {
                const formattedRow = { time: row.time };
                measureArray.forEach(key => {
                    if (row[key] !== undefined) {
                        formattedRow[key] = {
                            value: row[key],
                            unit: unitMap[key]
                        };
                    }
                });
                return formattedRow;
            });

            return res.status(200).json({
                message: 'Realtime data retrieved successfully',
                data: dataWithUnits
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getHistory(req, res) {
        await db.connect();
        try {
            const { device_id, device_name, device_label, customer_code, start_time, end_time } = req.query;

            if (!start_time || !end_time) {
                return res.status(400).json({ error: 'start_time and end_time are required' });
            }

            const resultpg = await measurement.getRealtime(device_id, device_name, device_label, customer_code);

            if (!resultpg) {
                return res.status(404).json({ error: 'No device found' });
            }

            const { measurement_list, unit_list, device_label: label, device_name: name, customer_code: code } = resultpg;

            const measureArray = measurement_list.split(',').map(item => item.trim());
            const unitArray = unit_list ? unit_list.split(',').map(item => item.trim()) : [];
            
            const unitMap = {};
            measureArray.forEach((measure, index) => {
                unitMap[measure] = unitArray[index] || '';
            });

            const resultinflux = await influx.historicalInflux(measurement_list, name, label, code, start_time, end_time);
            
            const dataWithUnits = resultinflux.map(row => {
                const formattedRow = { time: row.time };
                measureArray.forEach(key => {
                    if (row[key] !== undefined) {
                        formattedRow[key] = {
                            value: row[key],
                            unit: unitMap[key]
                        };
                    }
                });
                return formattedRow;
            });

            return res.status(200).json({
                message: 'Historical data retrieved successfully',
                data: dataWithUnits
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async setUnitByMeasurement(req, res) {
        await db.connect();
        try {
            const { device_name, device_label, measurementname, unit, unitcode } = req.body;
            if (!measurementname || !unit || !unitcode || (!device_name && !device_label)) {
                return res.status(400).json({ error: 'Required fields missing' });
            }

            const result = await measurement.setUnit(device_name, device_label, measurementname, unit, unitcode);
            return res.status(200).json({
                message: 'Unit updated successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async setThreshold(req, res) {
        await db.connect();
        try {
            const { device_name, device_label, measurementname, valuemin, valuemax, warning, danger } = req.body;
            if (!measurementname || !valuemin || !valuemax || !warning || !danger || (!device_name && !device_label)) {
                return res.status(400).json({ error: 'Required fields missing' });
            }

            const result = await measurement.setThreshold(device_name, device_label, measurementname, valuemin, valuemax, warning, danger);
            return res.status(200).json({
                message: 'Thresholds updated successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    // ฟังก์ชันสำหรับเพิ่มหรือแก้ไขข้อมูล
    async updateMeasurement(req, res) {
        await db.connect();
        try {
            const { 
                meas_id, device_id, zone_id, measurement_name, 
                measurement_lable, unit_id, value_min, value_max 
            } = req.body;
            
            // แก้ไข: ดึง member_id จาก Token (ระบบจะรู้เอง) ถ้าไม่มีให้ใช้ M0000001
            const user = req.user?.member_id || '00000001';

            if (!meas_id || !device_id || !measurement_name) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await measurement.updateMeasurement(
                meas_id, device_id, zone_id, measurement_name, 
                measurement_lable, unit_id, value_min, value_max, user
            );

            return res.status(200).json({
                message: 'Measurement update successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    // ฟังก์ชันสำหรับลบข้อมูล (Soft Delete)
    async deleteMeasurement(req, res) {
        await db.connect();
        try {
            const measurement_id = req.params.id;
            
            // ดึง member_id จาก Token ถ้าไม่มีให้ใช้ M0000001
            const user = req.user?.member_id || '00000001';

            if (!measurement_id) {
                return res.status(400).json({ error: 'Measurement ID is required' });
            }

            const result = await measurement.deleteMeasurement(measurement_id, user);
            
            return res.status(200).json({
                message: 'Measurement deleted successfully'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    //ฟังก์ชันสำหรับกู้คืนข้อมูล (Restore)
    async restoreMeasurement(req, res) { 
        await db.connect();
        try {
            const measurement_id = req.params.id;
            const user = req.user?.member_id || '00000001';

            if (!measurement_id) {
                return res.status(400).json({ error: 'Measurement ID is required' });
            }

            // เรียกใช้ฟังก์ชันใน model เพื่อเปลี่ยน is_active กลับเป็น true
            const result = await measurement.restoreMeasurement(measurement_id, user);

            return res.status(200).json({
                message: 'Measurement restored successfully',
                data: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }
}

module.exports = new MeasurementController();