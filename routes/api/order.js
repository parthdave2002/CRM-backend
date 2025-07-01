const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const OrderController = require('../../modules/order/orderController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-order',authentication,authorization("Order"), OrderController.getAllOrderList);
router.get('/add-return-product', authentication, OrderController.ReturnProductAdd);
router.post('/add-order',authentication,authorization("Order"), OrderController.AddOrUpdateOrderData);
router.put('/update-order',authentication,authorization("Order"), OrderController.UpdateOrder);
router.delete('/remove-order',authentication,authorization("Order"), OrderController.DeleteOrderData);
router.get('/get-callbacks', authentication, authorization('Order'), OrderController.GetCallBacks);
router.patch('/update-future-order',authentication, OrderController.UpdateFutureOrder);
router.get('/get-order-sales-executive',authentication,authorization("Order"), OrderController.getFilteredOrderList);

module.exports = router