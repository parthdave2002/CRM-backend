const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const productSch = require('../../schema/productSchema');

const productController = {};

productController.getAllProductList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      searchQuery = { $or: [{ name: searchRegex }] };
    }
    selectQuery = 'product_pic name price  description category avl_qty is_active added_at';
    const pulledData = await otherHelper.getQuerySendResponse(productSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, "Product Data get successfully", page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

productController.AddProductData = async (req, res, next) => {
  try {
    const Product = req.body;
    if (req.file) {
      Product.product_pic = req.file.filename; 
    }

    if (Product._id) {
      const update = await productSch.findByIdAndUpdate(Product._id, { $set: Product }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,  "Packing type Data updated successfully ", null);
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

    const deleted = await productSch.findByIdAndDelete(id);
    return otherHelper.sendResponse(res, httpStatus.OK, true, deleted, null, 'Product delete success', null);
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