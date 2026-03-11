const express = require('express');
const router = express.Router();
const meas = require('../controller/MeasurementController');
const auth = require('../lib/authentication');

//GET METHOD//
router.get('/getMeasurement', auth, meas.getMeasurement);
router.get('/getMeasurementById', auth, meas.getMeasurementById);
router.get('/getRealtime', auth, meas.getRealtime);
router.get('/getHistorical', auth, meas.getHistory);

// //PUT METHOD//
// router.post('/setIntervalByMeasurement', meas.setIntervalByMeasurement);
router.put('/setUnitByMeasurement', auth, meas.setUnitByMeasurement);
router.put('/setThreshold', auth, meas.setThreshold);


module.exports = router;