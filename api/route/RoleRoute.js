const express = require('express');
const router = express.Router();
const roleController = require('../controller/RoleController');
const auth = require('../lib/authentication');

router.get('/roles', roleController.getRoles);
router.post('/role', roleController.createRole);
router.put('/role/:id', roleController.updateRole);
router.put('/role/:id/cancel', roleController.cancelRole);
router.put('/role/:id/restore', roleController.restoreRole);

module.exports = router;