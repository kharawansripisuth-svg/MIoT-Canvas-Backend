const express = require('express');
const router = express.Router();
const device = require('../controller/DeviceController');
const auth = require('../lib/authentication');

// --- GET METHOD ---
router.get('/getDevice', auth, device.getDevice);
router.get('/getDeviceById', auth, device.getDeviceById);
router.get('/searchDevice', auth, device.searchDevice);
router.get('/summary', auth, device.getDeviceSummary);
router.get('/master', auth, device.getFormMaster);

// --- POST METHOD ---
router.post('/addDevice', auth, device.addDevice);

// --- PUT METHOD ---
router.put('/editDevice', auth, device.editDevice);
router.put('/setDeviceActive', auth, device.setDeviceActive);
router.put('/:id', auth, device.deleteDevice);

module.exports = router;