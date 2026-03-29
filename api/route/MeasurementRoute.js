const express = require('express');
const router = express.Router();
const meas = require('../controller/MeasurementController');
const auth = require('../lib/authentication');

//GET METHOD//
router.get('/getMeasurement', auth, meas.getMeasurement);
router.get('/getRealtime', auth, meas.getRealtime);
router.get('/getHistorical', auth, meas.getHistory);
router.get('/summary', meas.getDeviceSummary);
router.get('/:id', auth, meas.getMeasurementById);

// //PUT METHOD//
// router.post('/setIntervalByMeasurement', meas.setIntervalByMeasurement);
router.put('/setUnitByMeasurement', auth, meas.setUnitByMeasurement);
router.put('/setThreshold', auth, meas.setThreshold);
router.put('/:id', auth, meas.deleteMeasurement);
router.put('/restore/:id', meas.restoreMeasurement);

router.post('/update', auth, meas.updateMeasurement);

module.exports = router;