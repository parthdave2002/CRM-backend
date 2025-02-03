const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const ProductController = require('../../modules/adminProduct/productController');

router.get('/get-product', ProductController.getAllProductList);
router.post('/add-product', uploadHelper.uploadFiles('public/product', 'single', 'product_pic'), ProductController.AddProductData);
// router.put('/update-product', ProductController.AddRoles);
router.delete('/remove-product', ProductController.DeleteProductData);
router.get("/product-related", ProductController.ProductRelatedData)

 module.exports = router