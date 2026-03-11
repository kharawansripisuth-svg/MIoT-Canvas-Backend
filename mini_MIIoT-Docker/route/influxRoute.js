const express = require('express');
const router = express.Router();
const influxController = require('../Controller/InfluxDirectController');

// Get all measurements
router.get('/influx/measurements', (req, res) => influxController.getMeasurements(req, res));

// Get fields for a measurement
router.get('/influx/measurements/:measurement/fields', (req, res) => influxController.getFields(req, res));

// Get tags for a measurement
router.get('/influx/measurements/:measurement/tags', (req, res) => influxController.getTags(req, res));

// Get tag values
router.get('/influx/measurements/:measurement/tags/:tag/values', (req, res) => influxController.getTagValues(req, res));

// Query data (POST for complex queries)
router.post('/influx/query', (req, res) => influxController.queryData(req, res));

// Get latest data
router.get('/influx/measurements/:measurement/latest', (req, res) => influxController.getLatest(req, res));

// Get devices (from tags)
router.get('/influx/devices', (req, res) => influxController.getDevices(req, res));

module.exports = router;
