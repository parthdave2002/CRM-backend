const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const ProductController = require('../../modules/adminProduct/productController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-product',authentication,authorization("Product"), ProductController.getAllProductList);
router.post('/add-product',authentication,authorization("Product"), uploadHelper.uploadFiles('public/product', 'array', 'product_pics'), ProductController.AddProductData);
router.put('/update-product',authentication,authorization("Product"), uploadHelper.uploadFiles('public/product', 'array', 'product_pics'), ProductController.UpdateProductData);
router.delete('/remove-product',authentication,authorization("Product"), ProductController.DeleteProductData);
router.get("/product-related",authentication,authorization("Product"),  ProductController.ProductRelatedData)

 module.exports = router