const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const OrderController = require('../../modules/order/orderController');

router.get('/get-order', OrderController.getAllOrderList);
router.post('/add-order', OrderController.AddOrUpdateOrderData);
router.put('/update-order', OrderController.UpdateOrder);
router.delete('/remove-order', OrderController.DeleteOrderData);

module.exports = router