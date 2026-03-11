const express = require('express');
const router = express.Router();
const device = require('../controller/DeviceController');
const auth = require('../lib/authentication');

//GET METHOD//
router.get('/getDevice', auth, device.getDevice);
router.get('/getDeviceBy', auth, device.getDeviceById);
router.get('/search', auth, device.searchDevice);

//POST METHOD//

//PUT METHOD//
router.put('/addDevice', auth, device.addDevice);
router.put('/setDeviceActive', auth, device.setDeviceActive);

//PATCH METHOD//
router.patch('/editDevice', auth, device.editDevice);

module.exports = router;