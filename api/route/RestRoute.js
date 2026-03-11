const express = require('express');
const router = express.Router();
const rest = require('../controller/RestController');

//POST METHOD//
router.post('/devices/register', rest.registerDevice);
router.post('/data', rest.sendData);
router.get('/data', rest.getData);


module.exports = router;