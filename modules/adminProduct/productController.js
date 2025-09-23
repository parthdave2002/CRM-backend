const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const productSch = require('../../schema/productSchema');
const companySch = require('../../schema/companySchema');
const categorySch  = require('../../schema/adminCategorySchema');
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');

const productController = {};

// productController.getAllProductList = async (req, res, next) => {
//   try {
//     let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

//     const populatedata =[
//       { path: 'categories', model: 'categories', select: 'name_eng name_guj' },
//       { path: 'company', model: 'company', select: 'name_eng name_guj' },
//       { path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' },
//       { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
//     ];

//     if (req.query.id) {
//       const user = await productSch.findById(req.query.id).populate(populatedata);
//       if (!user) {
//         return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Product not found', null);
//       }
//       const responseData = {
//         ...user.toObject(),
//         out_of_stock: user.avl_qty === 0 ? true : false,
//       };
//       return otherHelper.sendResponse( res,httpStatus.OK, true, responseData, null,user.avl_qty === 0 ? 'Out of Stock' : 'Product data found', null
//       );
//     }  
//     searchQuery = { ...searchQuery, is_deleted: false };
    
//     if (req.query.search && req.query.search !== 'null') {
//       const regex = { $regex: req.query.search, $options: 'i' };

//       const companyIds = await companySch.find({
//         $or: [{ name_eng: regex }, { name_guj: regex }],
//       }).select('_id');

//       const searchResults = await productSch.find({
//         $or: [
//           { 'name.englishname': regex },
//           { 'name.gujaratiname': regex },
//           { 'tech_name.english_tech_name': regex },
//           { 'tech_name.gujarati_tech_name': regex },
//           { company: { $in: companyIds.map(c => c._id) } }, 
//         ],
//       }).populate(populatedata).exec();

//       if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);

//       const formattedResults = searchResults.map(product => ({
//         ...product.toObject(),
//         out_of_stock: product.avl_qty === 0 ? true : false,
//       }));

//       return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedResults, ' Search Data found', page, size, formattedResults.length);
//     }

//     if (req.query.crop) {
//       searchConditions.push({ crops: req.query.crop });
//       const searchResults = await productSch.find({ crops: req.query.crop, is_deleted: false }).populate(populatedata).exec();

//       if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);

//       const formattedResults = searchResults.map((product) => ({
//         ...product.toObject(),
//         out_of_stock: product.avl_qty === 0 ? true : false,
//       }));

//       return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedResults, ' Search Data found', page, size, formattedResults.length);
//     }
//     const pulledData = await otherHelper.getQuerySendResponse(productSch, page, size, sortQuery, searchQuery, selectQuery, next, populatedata);

//     const formattedProducts = pulledData.data.map(product => ({
//       ...product.toObject(),
//       out_of_stock: product.avl_qty === 0 ? true : false,
//     }));

//     return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedProducts, 'Product Data get successfully', page, size, pulledData.totalData);
//   } catch (err) {
//     next(err);
//   }
// };

productController.getAllProductList = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10);

    const populatedata = [
      { path: 'categories', model: 'categories', select: 'name_eng name_guj' },
      { path: 'company', model: 'company', select: 'name_eng name_guj' },
      { path: 'packagingtype', model: 'packing-type', select: 'type_eng type_guj' },
      { path: 'crops', model: 'crop', select: 'name_eng name_guj' },
    ];

    if (req.query.id) {
      const user = await productSch.findById(req.query.id).populate(populatedata);
      if (!user) {
        return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Product not found', null);
      }
      const similarProduct = await productSch.find({ categories: user.categories }).populate(populatedata).limit(8);
      const responseData = {
        ...user.toObject(),
        out_of_stock: user.avl_qty === 0 ? true : false,
        similarProduct,
      };
      return otherHelper.sendResponse(res, httpStatus.OK, true, responseData, null, user.avl_qty === 0 ? 'Out of Stock' : 'Product data found', null);
    }

    if (req.query.category) {
      const categoryWiseProducts = await productSch.find({ categories: req.query.category }).populate(populatedata);
      if (!categoryWiseProducts) {
        return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, null, 'Product not found', null);
      }
      const formattedResults = categoryWiseProducts.map((product) => ({
        ...product.toObject(),
        out_of_stock: product.avl_qty === 0 ? true : false,
      }));

      return otherHelper.sendResponse(res, httpStatus.OK, true, formattedResults, null, 'Product data found', null);
    }
    searchQuery = { ...searchQuery, is_deleted: false };

    if (req.query.search && req.query.search !== 'null') {
      const regex = { $regex: req.query.search, $options: 'i' };
      const isValidObjectId = mongoose.Types.ObjectId.isValid(req.query.search);

      let categoryFilter = [];

      if (isValidObjectId) {
        categoryFilter.push({ _id: mongoose.Types.ObjectId(req.query.search) });
      } else {
        categoryFilter.push({ name_eng: regex }, { name_guj: regex });
      }

      const categoryIds = await categorySch.find({ $or: categoryFilter }).select('_id');

      const companyIds = await companySch
        .find({
          $or: [{ name_eng: regex }, { name_guj: regex }],
        })
        .select('_id');

      let searchResults = await productSch
        .find({
          $or: [{ 'name.englishname': regex }, { 'name.gujaratiname': regex }, { 'tech_name.english_tech_name': regex }, { 'tech_name.gujarati_tech_name': regex }, { company: { $in: companyIds.map((c) => c._id) } }, { categories: { $in: categoryIds.map((c) => c._id) } }],
        })
        .populate(populatedata).skip((page-1)*size).limit(size)
        .exec();

        searchResults.totalData = await productSch
          .countDocuments({
            $or: [{ 'name.englishname': regex }, { 'name.gujaratiname': regex }, { 'tech_name.english_tech_name': regex }, { 'tech_name.gujarati_tech_name': regex }, { company: { $in: companyIds.map((c) => c._id) } }, { categories: { $in: categoryIds.map((c) => c._id) } }],
          })
         

      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, [], [], 'Data not found', null);

      const formattedResults = searchResults.map((product) => ({
        ...product.toObject(),
        out_of_stock: product.avl_qty === 0 ? true : false,
      }));

      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedResults, ' Search Data found', page, size, searchResults.totalData);
    }

    if (req.query.crop) {
      searchConditions.push({ crops: req.query.crop });
      const searchResults = await productSch.find({ crops: req.query.crop, is_deleted: false }).populate(populatedata).exec();

      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, [], [], 'Data not found', null);

      const formattedResults = searchResults.map((product) => ({
        ...product.toObject(),
        out_of_stock: product.avl_qty === 0 ? true : false,
      }));

      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedResults, ' Search Data found', page, size, formattedResults.length);
    }
    const pulledData = await otherHelper.getQuerySendResponse(productSch, page, size, sortQuery, searchQuery, selectQuery, next, populatedata);

    const formattedProducts = pulledData.data.map((product) => ({
      ...product.toObject(),
      out_of_stock: product.avl_qty === 0 ? true : false,
    }));

    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, formattedProducts, 'Product Data get successfully', page, size, pulledData.totalData);
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
    if (Product.description && typeof Product.description === "string") {
      try {
        Product.description = JSON.parse(Product.description);
      } catch (error) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Invalid description format", null);
      }
    }

   if (Product.crops && typeof Product.crops === 'string') {
      try {
        Product.crops = JSON.parse(Product.crops);
      } catch (error) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Crops format', null);
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

        // const existingProduct = await productSch.findOne({ name: Product.name,packing:Product.packing,packing_type:Product.packagingtype  });
            const existingProduct = await productSch.findOne({ name: Product.name, packaging: Product.packaging, packagingtype: Product.packagingtype });
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
    if(!id) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product id required', null);

    const Product = await productSch.findById(id);
    if(!Product) return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product not found', null);

    // if (Product.product_pics && Product.product_pics.length > 0) {
    //   Product.product_pics.forEach((filename) => {
    //     const filePath = path.join(__dirname, '../../public/product', filename);
    //     if (fs.existsSync(filePath)) {
    //       fs.unlinkSync(filePath);
    //     }
    //   });
    // }

    const deleted = await productSch.findByIdAndUpdate(id, {is_deleted: true, is_active: false}, {new: true});
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

productController.UpdateProductData = async (req, res, next) => {
  try {
    let { id, ...updatedData } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return otherHelper.sendResponse(res, 400, false, null, null, "Invalid Product ID", null);
    }

    const productId = new mongoose.Types.ObjectId(id);
    const existingProduct = await productSch.findById(productId);
    if (!existingProduct) {
      return otherHelper.sendResponse(res, 400, false, null, null, "Product not found", null);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);

      if (existingProduct.product_pics && existingProduct.product_pics.length > 0) {
        existingProduct.product_pics.forEach((image) => {
          const imagePath = path.join(__dirname, "../../public/product", image);
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath);
            } catch (err) {
              console.error("Error deleting file:", err);
            }
          }
        });
      }

      updatedData.product_pics = newImages;
    }
    if (updatedData.description && typeof updatedData.description === "string") {
      try {
        updatedData.description = JSON.parse(updatedData.description);
      } catch (error) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, "Invalid description format", null);
      }
    }
    if (updatedData.crops && typeof updatedData.crops === 'string') {
      try {
        updatedData.crops = JSON.parse(updatedData.crops);
      } catch (error) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Invalid Crops format', null);
      }
    }

    if (existingProduct.name.englishname !== updatedData.name.englishname || existingProduct.name.gujaratiname !== updatedData.name.gujaratiname || existingProduct.packaging.toString() !== updatedData.packaging.toString() || existingProduct.packagingtype.toString() !== updatedData.packagingtype.toString()) {
      const existingProducts = await productSch.findOne({ name: updatedData.name, packaging: updatedData.packaging, packagingtype: updatedData.packagingtype });
      if (existingProducts) {
        return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null, 'Product is already exist ', null);
      }
    }
    const updatedProduct = await productSch.findByIdAndUpdate(
      productId,
      { $set: updatedData },
      { new: true }
    );

    return otherHelper.sendResponse(res, 200, true, updatedProduct, null, "Product updated successfully", null);
  } catch (err) {
    next(err);
  }
};

module.exports = productController;