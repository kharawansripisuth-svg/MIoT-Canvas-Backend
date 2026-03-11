const express = require('express');
const router = express.Router();
const CUDeviceController = require('../Controller/CUDeviceController');

router.put('/selectmeasurement', CUDeviceController.selectDeviceMeasurement);

module.exports = router;