const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const ProductController = require('../../modules/adminProduct/productController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-product',authentication, ProductController.getAllProductList);
router.post('/add-product',authentication, uploadHelper.uploadFiles('public/product', 'array', 'product_pics'), ProductController.AddProductData);
// router.put('/update-product', ProductController.AddRoles);
router.delete('/remove-product',authentication, ProductController.DeleteProductData);
router.get("/product-related",authentication,  ProductController.ProductRelatedData)

 module.exports = router