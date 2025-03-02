const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const OrderController = require('../../modules/order/orderController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-order',authentication, OrderController.getAllOrderList);
router.post('/add-order',authentication, OrderController.AddOrUpdateOrderData);
router.put('/update-order',authentication, OrderController.UpdateOrder);
router.delete('/remove-order',authentication, OrderController.DeleteOrderData);

module.exports = router