const httpStatus = require('http-status');
const { getAccessData } = require('../../helper/Access.helper');
const   module_acccessSch  = require('../../schema/module_accessschema');
const otherHelper = require('../../helper/others.helper');
const module_access = require('./module_accessConfig');
const module_accessController = {};

module_accessController.getModule = async (req, res, next) => {
  const query = { sub_module_id: { $eq: req.query.id } };

  if (req.query.id) {
    const menu = await module_acccessSch.find(query).select('access_name client_route');
    return otherHelper.sendResponse(res, httpStatus.OK, true, menu, null, module_access.get, null);
  }

  try {
    // const module = await module_acccessSch.find().select('module_id access_name restricted_menu client_route is_active');
    // let AccessData = await getAccessData(req);
    // return otherHelper.sendResponse(res, httpStatus.OK, true, {module,AccessData}, null, module_access.get, null);

    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);
    let pulledData = await otherHelper.getQuerySendResponse(module_acccessSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    let AccessData = await getAccessData(req);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, {module:pulledData.data, AccessData: AccessData}, module_access.get, page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};


module_accessController.getsearchModule = async (req, res, next) => {
  const moduleacces = await module_acccessSch.find({
    $or: [{ access_name : { $regex: req.query.key } }],
  });
  return otherHelper.sendResponse(res, httpStatus.OK, true, moduleacces, null,  module_access.get, null, 'Module access Not Found');
};



module_accessController.DeleteModule = async (req, res, next) => {
  try {
    const menuId = req.params.id;
    const menu = await module_acccessSch.findByIdAndUpdate(
      menuId,
      {
        $set: { is_deleted: true },
      },
      { new: true },
    );
    return otherHelper.sendResponse(res, httpStatus.OK, true, menu, null, module_access.delete, null);
  } catch (err) {
    next(err);
  }
};


module_accessController.postModule = async (req, res, next) => {
  try {
    const module_access = req.body;

    if (module_access && module_access.id != 0) {
      module_access.updated_by = req.user.id;
      module_access.updated_at = Date.now();
      const update = await module_acccessSch.findByIdAndUpdate({ _id: module_access.id }, { $set: module_access }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null,module_access.save, null);
    } else {
      module_access.added_by = req.user.id;
      module_access.added_at = Date.now();
      let newmodule_access = new module_acccessSch(module_access);
      let saved = await newmodule_access.save();
      return otherHelper.sendResponse(res, httpStatus.OK, true, saved, null, module_access.save, null);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = module_accessController ;
