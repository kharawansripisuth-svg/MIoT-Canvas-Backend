const express = require('express');
const router = express.Router();
const service = require('../controller/ServiceController');
const auth = require('../lib/authentication');

//GET METHOD//
router.get('/status/mqtt', auth, service.mqttHealthCheck.bind(service));
router.get('/status/influx', auth, service.checkInfluxConnection.bind(service));

module.exports = router;