const pgService = require('../../service/services/postgres-service');
const Device = require('../models/PostgreSQL/Device');
const Topic = require('../models/PostgreSQL/Topic');
const Newid = require('../lib/Newid'); // path ไปยังไฟล์ genDeviceId
const Auth = require('../lib/authentication'); // path ไปยังไฟล์ genDeviceId

const db = new pgService();
const device = new Device();
const topic = new Topic();
const newId = new Newid();


class DeviceController {

  // ** Add Device ** //  
  async addDevice(req, res) {
  try {
    const { device_name, device_label, device_type, topic_name, broker_host, broker_port, customer_code, location, device_area, vendor_name, description, serial_number } = req.body;

    if (!device_name || !device_label || !device_type || !topic_name || !broker_host || broker_port === undefined || !customer_code || !location || !device_area || !vendor_name || !description || !serial_number) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newDeviceId = await newId.genDeviceId();

    const newBrokerId = await newId.genBrokerId();

    const newVendorId = await newId.genVendorId();

    const result = await device.addDevice(
      newDeviceId, 
      device_name, 
      device_label, 
      device_type,
      topic_name, 
      newBrokerId, 
      broker_host, 
      broker_port, 
      customer_code, 
      location, 
      device_area, 
      newVendorId, 
      vendor_name, 
      description, 
      serial_number
    );

    res.status(201).json({ 
      message: 'Device added successfully', 
      device_id: result
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
  // ** End of Add Device ** //

  // ** Edit Device ** //
async editDevice(req, res) {
  await db.connect();
  try {
    const {
      device_name,
      device_label,
      device_area,
      device_description,
      device_location,
      topic_name,
      broker_name,
      broker_port
    } = req.body;
    
    const {device_id} = req.query;

    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    const sql = await device.editDevice(
      device_id, 
      device_name, 
      device_label, 
      device_area, 
      device_description, 
      device_location, 
      topic_name, 
      broker_name, 
      broker_port);
      
    const values = [
      device_id,
      device_name || null,
      device_label || null,
      device_area || null,
      device_description || null,
      device_location || null,
      topic_name || null,
      broker_name || null,
      broker_port || null
    ];

    const result = await db.query(sql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    return res.status(200).json({
      message: 'Device updated successfully',
      device: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await db.close?.();
  }
}
  // ** End of Edit Device ** //

  // ** Get Device ** //
  async getDevice(req, res) {
    try {
      const devices = await device.getActiveDevices();
      return res.status(200).json({
        message: 'Show all active devices successfully',
        device: devices
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // get by id go down here
  async getDeviceById(req, res) {
    try {
      const { device_id, device_name, device_label} = req.query;
      if (!device_id && !device_name && !device_label) {
        return res.status(400).json({ error: 'device_id or device_name or device_label is required' });
      }
      const deviceResult = await device.getDeviceById(device_id,device_name,device_label);
      if (deviceResult.rows === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }
      // ส่ง response กลับ
      return res.status(200).json({
        message: 'Show device by id successfully',
        device: deviceResult
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      await db.close?.();
    }
  }
  // ** End of Get Device ** //

  // ** Search Device ** //
  async searchDevice(req, res) {
    await db.connect();
    try {
      const { device_id,device_name, device_label, customer_code, customernameeng} = req.query;
      if (!device_id && !device_name && !device_label && !customer_code && !customernameeng) {
        return res.status(400).json({ error: 'Need one or more parameters' });
      }
      const searchResult = await device.searchDevice(device_id, device_name, device_label, customer_code, customernameeng);
      if (searchResult.rows === 0) {
        return res.status(404).json({ error: 'No device found' });
      }
      return res.status(201).json({
        message: 'Search device successfully',
        device: searchResult.rows
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      await db.close?.();
    }
  }

  async setDeviceActive(req, res) {
    try {
      const { device_id,device_name,device_label, status } = req.body;
      if (!device_id && !device_label && !device_name) {
        return res.status(400).json({ error: 'device_id or device_label or device_name are required' });
      }
      if (status === undefined) {
        return res.status(400).json({ error: 'status is required' });
      }
      const setDeviceActiveResult = await device.setActive(device_id, status);
      if (setDeviceActiveResult.rows.length === 0) {
        return res.status(404).json({ error: 'Device not found' });
      }
      return res.status(201).json({
        message: 'Device status updated successfully',
        device: setDeviceActiveResult.rows[0]
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } finally {
      await db.close?.();
    }
  }
}

module.exports = new DeviceController();