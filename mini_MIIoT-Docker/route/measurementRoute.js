const express = require('express');
const router = express.Router();
const measurementController = require('../Controller/MeasurementController');

// Measurement query routes
router.post('/measurements/query', (req, res) => measurementController.queryMeasurements(req, res));
router.post('/measurements/export', (req, res) => measurementController.exportMeasurements(req, res));
router.get('/measurements/fields', (req, res) => measurementController.getAvailableFields(req, res));

module.exports = router;
