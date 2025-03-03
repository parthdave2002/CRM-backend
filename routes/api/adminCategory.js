const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const CategoryController = require('../../modules/adminProduct/adminCategoryController');

router.get("/get-category",authentication,authorization("Category"), CategoryController.getAllCategoryList)
router.post("/add-category",authentication, authorization("Category"),uploadHelper.uploadFiles('public/category', 'single', 'category_pic'), CategoryController.AddCategory)
router.delete("/remove-category",authentication,authorization("Category"), CategoryController.DeleteCategory)

module.exports = router