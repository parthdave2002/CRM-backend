const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const productSch = require('../../schema/productSchema');
const path = require('path');
const fs = require('fs');

const productController = {};

productController.getAllProductList = async (req, res, next) => {
  try {
    if (req.query.id) {
      const user = await productSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Product data found', null);
    }
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await productSch.find({
        $or: [{ name: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search Data found', page, size, searchResults.length);
    }
    selectQuery = 'product_pics name price  description categories avl_qty is_active added_at';
    populate = [
      { path: 'categories', model: 'categories', select: 'name_eng' },
      { path: 'company', model: 'company', select: 'name_eng' },
      { path: 'packagingtype', model: 'packing-type', select: 'type' },
    ];

    const pulledData = await otherHelper.getQuerySendResponse(productSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, 'Product Data get successfully', page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

productController.AddProductData = async (req, res, next) => {
  try {
    const Product = req.body;
    if (req.files) {
      Product.product_pics = req.files.map(file => file.filename);
    }
    if (typeof Product.description === "string") {
      try {
        Product.description = JSON.parse(Product.description);
      } catch (error) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Invalid description format", null);
      }
    }

    if (!Array.isArray(Product.description)) {
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Description must be an array", null);
    }
    Product.description = Product.description.map(desc => Object.assign({}, desc));

    if (Product._id) {
      const update = await productSch.findByIdAndUpdate(Product._id, { $set: Product }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Product updated successfully ", null);
    } else {

        const existingProduct = await productSch.findOne({ name: Product.name });
        if(existingProduct){
            return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Product is already exist ", null);
        }
      
      const newProduct = new productSch(Product);
      await newProduct.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newProduct, null, "Product Created successfully", null);
    }
  } catch (err) {
    next(err);
  }
};

productController.DeleteProductData = async (req, res, next) => {
  try {
    const id = req.query.id;
    if(!id){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product id required', null);
    }

    const Product = await productSch.findById(id);
    if(!Product){
      return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product not found', null);
    }

    if (Product.product_pics && Product.product_pics.length > 0) {
      Product.product_pics.forEach((filename) => {
        const filePath = path.join(__dirname, '../../public/product', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    const deleted = await productSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Product delete successfully', null);
  } catch (err) {
    next(err);
  }
};


productController.ProductRelatedData = async (req, res, next) => {
  try {
    const  search = req.query.data;
    const data = await Product.find({
      $or: 
        [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }); 
    return otherHelper.sendResponse(res, httpStatus.OK, true, data, null, 'Product data get success', null);
  } catch (err) {
    next(err);
  }
};



module.exports = productController;