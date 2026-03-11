const express = require('express');
const router = express.Router();
const cus = require('../controller/CustomerController');
const auth = require('../lib/authentication');

//GET METHOD//
router.get('/getCustomer', auth,cus.getCustomer);
router.get('/getActiveCustomer', auth,cus.getActiveCustomer);
router.get('/getInactiveCustomer', auth,cus.getInactiveCustomer);
router.get('/getCustomer/:customer_id', auth,cus.getCustomerById);
router.get('/selectCustomer/:customer_id', auth,cus.selectCustomer);
router.get('/unselectCustomer/:customer_id', auth,cus.unselectCustomer);

//PUT METHOD//
router.put('/addCustomer', auth,cus.addCustomer);
router.put('/setActiveCustomer', auth,cus.setActiveCustomer);
router.put('/editCustomer/:customer_id', auth,cus.editCustomer);

module.exports = router;