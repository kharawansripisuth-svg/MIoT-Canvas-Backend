const express = require('express');
const router = express.Router();
const permissionController = require('../controller/PermissionController');

router.get('/permissions', permissionController.getPermissions);
router.post('/permission', permissionController.createPermission);
router.put('/permission/:id', permissionController.updatePermission);
router.put('/permission/:id/cancel', permissionController.cancelPermission);
router.put('/permission/:id/restore', permissionController.restorePermission);
router.post('/role-permission', permissionController.updateRolePermissions);

module.exports = router;