const express = require('express');
const router = express.Router();
const customerController = require('../../modules/customer/customerController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-customers',authentication, customerController.getAllCustomerList);
router.post('/add-customer',authentication,  customerController.AddCustomerData);
router.put('/update-customer/:id',authentication,  customerController.updateCustomerData);
router.delete('/remove-customer',authentication,  customerController.DeleteCustomerData);
router.put('/change-status',authentication,  customerController.changeStatus);


module.exports = router;