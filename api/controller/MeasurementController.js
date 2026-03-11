const PostgresService = require('../../service/services/postgres-service');
const Measurement = require('../models/PostgreSQL/Measurement');
const InfluxQuery = require('../models/InfluxDB/influx-realtime-byid');
const GetId = require('../lib/GetDeviceId');


const db = new PostgresService();
const measurement = new Measurement();
const influx = new InfluxQuery();
const getId = new GetId();
// const mqtt = require('../services/mqtt-service');

class MeasurementController {

    async getMeasurement(req, res) {
        await db.connect();
        try{

            const result = await measurement.getMeasurement();
            if (result.rows === 0) {
                return res.status(404).json({ error: 'No measurements found' });
            }
            return res.status(200).json
            ({
                message: 'Show all measurements successfully',
                measurement: result
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
            const { measurement_id } = req.query;
            
            if (!measurement_id) {
                return res.status(400).json({ error: 'Measurement ID is required' });
            }

            const measurementResult = await measurement.getMeasurementById(measurement_id);
            if (measurementResult.rows === 0) {
                return res.status(404).json({ error: 'Measurement not found' });
            }
            return res.status(200).json({
                message: 'Show measurement by ID successfully',
                measurement: measurementResult
            });
        } catch (error) {
            console.log(error);
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
                return res.status(400).json({ error: 'Device ID is required' });
            }

            // 1. ดึงข้อมูลและ Config จาก Postgres
            const resultpg = await measurement.getRealtime(device_id, req.query.device_name, req.query.device_label, req.query.customer_code);

            if (!resultpg) { // เช็คกรณี query ไม่เจอข้อมูล
                return res.status(404).json({ error: 'No device found' });
            }

            // 2. ดึงคอลัมน์จาก row แรก (รับ unit_list มาด้วย)
            const { 
                measurement_list, 
                unit_list, // <--- ได้มาจาก SQL string_agg
                device_label: label, 
                device_name: name, 
                customer_code: code 
            } = resultpg;

            // 3. สร้าง Mapping ระหว่าง Measurement กับ Unit
            const measureArray = measurement_list.split(',').map(item => item.trim());
            const unitArray = unit_list ? unit_list.split(',').map(item => item.trim()) : [];
            
            const unitMap = {};
            measureArray.forEach((measure, index) => {
                unitMap[measure] = unitArray[index] || ''; // จับคู่ชื่อ measurement กับ unit
            });

            // 4. เรียกฟังก์ชัน Influx wrapper
            const resultinflux = await influx.realtimeInflux(measurement_list, name, label, code);
            
            // 5. นำ Unit ไปต่อท้าย Response ให้สวยงาม
            // สมมติว่า resultinflux เป็น Array ของข้อมูล
            const dataWithUnits = resultinflux.map(row => {
                const formattedRow = { time: row.time }; // เก็บเวลาไว้
                
                // วนลูปเฉพาะ key ที่เป็น measurement เพื่อใส่ค่าและหน่วย
                measureArray.forEach(key => {
                    if (row[key] !== undefined) {
                        formattedRow[key] = {
                            value: row[key],
                            unit: unitMap[key] // ใส่หน่วยที่ Map ไว้
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
            const { device_id, device_name, device_label, customer_code, end_time, start_time } = req.query;

            // ตรวจสอบข้อมูลเวลา
            if (!end_time || !start_time) {
                return res.status(400).json({ error: 'start_time and end_time are required' });
            }

            // ตรวจสอบข้อมูลอุปกรณ์
            if (!device_id && !device_name && !device_label && !customer_code) {
                return res.status(400).json({ error: 'At least one device identifier is required' });
            }

            // 1. ดึง Config จาก Postgres (จะได้ measurement_list และ unit_list จาก SQL ที่เพิ่งแก้)
            const resultpg = await measurement.getRealtime(device_id, device_name, device_label, customer_code);

            // แก้ไขเช็คเงื่อนไข ป้องกัน Error ถ้า resultpg เป็น undefined
            if (!resultpg) {
                return res.status(404).json({ error: 'No device found' });
            }

            // 2. ดึง unit_list ออกมาจากผลลัพธ์ DB
            const { 
                measurement_list, 
                unit_list, // <--- ดึง unit_list มาใช้
                device_label: label, 
                device_name: name, 
                customer_code: code 
            } = resultpg;

            // 3. เตรียมการทำ Mapping ระหว่าง Measurement กับ Unit
            const measureArray = measurement_list.split(',').map(item => item.trim());
            const unitArray = unit_list ? unit_list.split(',').map(item => item.trim()) : [];
            
            const unitMap = {};
            measureArray.forEach((measure, index) => {
                unitMap[measure] = unitArray[index] || '';
            });

            // 4. ดึงข้อมูลประวัติ (History) จาก InfluxDB
            const resultinflux = await influx.historicalInflux(measurement_list, name, label, code, start_time, end_time);
            
            // 5. นำ Unit ไปต่อท้ายให้กับข้อมูลทุกๆ Row ใน History
            const dataWithUnits = resultinflux.map(row => {
                const formattedRow = { time: row.time }; // เก็บเวลาไว้เสมอ
                
                measureArray.forEach(key => {
                    // ถ้าในเวลานั้นๆ มีค่าตัวแปรนี้ ให้ทำการจัดรูปแบบเพิ่ม value และ unit
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

    async setIntervalByMeasurement(req,res){
        await db.connect();
        try {
            const { measurement_id } = req.query;
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async setUnitByMeasurement(req,res){
        await db.connect();
        try {
            const { device_name,device_label,measurementname, unit, unitcode } = req.body;
            if (!measurementname || !unit || !unitcode) {
                return res.status(400).json({ error: 'measurementname, unit, and unitcode are required' });
            }
            if (!device_name && !device_label) {
                return res.status(400).json({ error: 'device_name or device_label are required' });
            }

            const setUnit = await measurement.setUnit(device_name, device_label, measurementname, unit, unitcode);

            // const result = await db.query(
            //     `SELECT *
            //      FROM adm_devicemeasurement
            //      WHERE device_id = $1 AND measurementname = $2;`,
            //     [deviceIdValue, measurementname]
            // );
            return res.status(200).json({
                message: 'Unit updated successfully',
                data:setUnit
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async setThreshold(req,res){
        await db.connect();
        try {
            const { device_name, device_label, measurementname, valuemin, valuemax, warning, danger } = req.body;
            if (!device_name && !device_label) {
                return res.status(400).json({ error: 'measurement_id, measurementname, device_name, or device_label is required' });
            }
            if (!measurementname ||!valuemin || !valuemax || !warning || !danger) {
                return res.status(400).json({ error: 'measurementname, valuemin, valuemax, warning threshold, and danger threshold are required' });
            }
            const deviceIdValue = await getId.getDeviceIdbyName(device_name, device_label);

            if (!deviceIdValue) {
                return res.status(404).json({ error: 'Device not found' });
            }

            const setThreshold = await measurement.setThreshold(device_name, device_label, measurementname, valuemin, valuemax, warning, danger);
            return res.status(200).json({
                message: 'Thresholds updated successfully',
                data: setThreshold
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