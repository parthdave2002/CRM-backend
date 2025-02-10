const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const OrderController = require('../../modules/order/orderController');

router.get('/get-order', OrderController.getAllOrderList);
router.post('/add-order', OrderController.AddOrderData);

module.exports = router