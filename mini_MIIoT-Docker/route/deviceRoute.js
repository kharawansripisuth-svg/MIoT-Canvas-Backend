const express = require('express');
const router = express.Router();
const deviceController = require('../Controller/DeviceController');
const alertController = require('../Controller/AlertController');

// Device routes
router.get('/devices', (req, res) => deviceController.getAllDevices(req, res));
router.get('/devices/:id', (req, res) => deviceController.getDeviceById(req, res));
router.get('/devices/:id/latest', (req, res) => deviceController.getDeviceLatest(req, res));

// Device alerts routes
router.get('/devices/:device_id/alerts', (req, res) => alertController.getDeviceAlerts(req, res));

// Alert routes
router.get('/alerts', (req, res) => alertController.getAllAlerts(req, res));
router.get('/alerts/history', (req, res) => alertController.getAlertHistory(req, res));
router.post('/alerts', (req, res) => alertController.createAlert(req, res));
router.put('/alerts/:alert_id', (req, res) => alertController.updateAlert(req, res));
router.delete('/alerts/:alert_id', (req, res) => alertController.deleteAlert(req, res));

module.exports = router;
