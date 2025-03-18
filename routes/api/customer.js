const express = require('express');
const router = express.Router();
const customerController = require('../../modules/customer/customerController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-customers',authentication,authorization("Customer"), customerController.getAllCustomerList);
router.post('/add-customer',authentication,authorization("Customer"),  customerController.AddCustomerData);
router.put('/update-customer/:id',authentication,authorization("Customer"),  customerController.updateCustomerData);
router.delete('/remove-customer',authentication,authorization("Customer"),  customerController.DeleteCustomerData);
router.put('/change-status',authentication,authorization("Customer"),  customerController.changeStatus);
router.get('/matchnumber',authentication,  customerController.matchNumber);

module.exports = router;