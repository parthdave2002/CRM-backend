const httpStatus = require('http-status');

const   module_acccessSch  = require('../../schema/module_user_accessschema');
const otherHelper = require('../../helper/others.helper');
const module_access = require('./module_user_accessConfig');
const module_user_accessController = {};


module_user_accessController.getModule = async (req, res, next) => {
  try {
    const module = await module_acccessSch.find().select('module_id permission access_name client_route  is_active');
    return otherHelper.sendResponse(res, httpStatus.OK, true, module, null, module_access.get, null);
  } catch (err) {
    next(err);
  }
};

module_user_accessController.DeleteModule = async (req, res, next) => {
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


module_user_accessController.postModule = async (req, res, next) => {
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

module.exports = module_user_accessController ;
