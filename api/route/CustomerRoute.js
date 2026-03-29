const express = require('express');
const router = express.Router();
const cus = require('../controller/CustomerController');
const auth = require('../lib/authentication');

// --- GET METHOD ---
// เปลี่ยน getCustomer -> getCustomers
router.get('/getCustomer', auth, cus.getCustomers); 

// เปลี่ยน getActiveCustomer -> getActiveCustomers
router.get('/getActiveCustomer', auth, cus.getActiveCustomers); 

// ใน Controller ใหม่ เรายุบ All/Active/Inactive ไว้ในฟังก์ชันกลางแล้ว 
// แต่ถ้าตองยังอยากแยก Route เดิม ให้เรียก getCustomers เหมือนกันได้ครับ 
router.get('/getInactiveCustomer', auth, cus.getCustomers); 

router.get('/getCustomer/:customer_id', auth, cus.getCustomerById);

// ใน Controller ใหม่ ผมยุบ Select/Unselect เป็นฟังก์ชันเดียวคือ updateSelectStatus
// เพื่อให้จัดการง่ายผ่าน Body { is_selected: true/false }
router.put('/updateSelectStatus/:customer_id', auth, cus.updateSelectStatus); 

// --- PUT/POST METHOD ---
// ปกติการเพิ่มข้อมูลใหม่ควรใช้ .post นะครับ แต่ถ้าตองจะใช้ .put ตามเดิมก็ได้ครับ
router.put('/addCustomer', auth, cus.addCustomer); 

router.put('/setActiveCustomer', auth, cus.setActiveStatus); // เปลี่ยน setActiveCustomer -> setActiveStatus
router.put('/editCustomer/:customer_id', auth, cus.editCustomer);

module.exports = router;