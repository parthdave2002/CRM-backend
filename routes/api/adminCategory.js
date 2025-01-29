const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const CategoryController = require('../../modules/adminProduct/adminCategoryController');

router.get("/", CategoryController.getAllCategoryList)
router.post("/add-category",uploadHelper.uploadFiles('public/category', 'single', 'category_pic'), CategoryController.AddCategory)
router.delete("/remove-category", CategoryController.DeleteCategory)

module.exports = router