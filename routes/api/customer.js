const express = require('express');
const router = express.Router();
const customerController = require('../../modules/customer/customerController');

router.get('/get-customers', customerController.getAllCustomerList);
router.post('/add-customer', customerController.AddCustomerData);
router.put('/update-customer/:id', customerController.updateCustomerData);
router.delete('/remove-customer', customerController.DeleteCustomerData);
router.put('/change-status', customerController.changeStatus);


module.exports = router;