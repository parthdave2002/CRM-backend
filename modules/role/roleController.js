const httpStatus = require('http-status');
const otherHelper = require('../../helper/others.helper');
const roleSch = require('../../schema/roleSchema');
const roleAccessModel = require('../../schema/role_accessschema');

const { getAccessData } = require('../../helper/Access.helper');
const roleConfig = require('./roleConfig');

const roleController = {};

// Role API Code End
roleController.GetRoles = async (req, res, next) => {
  try {
    let { page, size, populate, selectQuery, searchQuery, sortQuery } = otherHelper.parseFilters(req, 10, false);
    selectQuery = 'role_title description is_active is_deleted';

    if (req.query.id) {
      const user = await roleSch.findById(req.query.id);
      return otherHelper.sendResponse(res, httpStatus.OK, true, user, null, 'Role Data found', null);
    }
  
    if (req.query.search && req.query.search !== 'null') {
      const searchResults = await roleSch.find({
        $or: [{ role_title: { $regex: req.query.search, $options: 'i' } }],
      });
      if (searchResults.length === 0) return otherHelper.sendResponse(res, httpStatus.OK, true, null, [], 'Data not found', null);
      return otherHelper.paginationSendResponse(res, httpStatus.OK, true, searchResults, ' Search Data found', page, size, searchResults.length);
    }
    
    let pulledData = await otherHelper.getQuerySendResponse(roleSch, page, size, sortQuery, searchQuery, selectQuery, next, populate);
    let AccessData = await getAccessData(req);
    return otherHelper.paginationSendResponse(res, httpStatus.OK, true, pulledData.data, roleConfig.roleGet, page, size, pulledData.totalData);
  } catch (err) {
    next(err);
  }
};

roleController.GetRoleDetail = async (req, res, next) => {
  const roles = await roleSch.findById(req.query.id, { is_active: 1, role_title: 1, description: 1 });
  return otherHelper.sendResponse(res, httpStatus.OK, true, roles, null, roleConfig.roleGet, null, 'Role Not Found');
};

roleController.AddRoles = async (req, res, next) => {

  try {
    const role = req.body;
    if (role.id) {
      const update = await roleSch.findByIdAndUpdate(role.id, { $set: role }, { new: true });
      return otherHelper.sendResponse(res, httpStatus.OK, true, update, null, roleConfig.roleSave, null);
    } else {
      // role.added_by = req.user.id;
      const newRole = new roleSch(role);
      await newRole.save();
      //create new access with every module
      // const all_modules = await moduleSchema.find().select('_id').lean();
      return otherHelper.sendResponse(res, httpStatus.OK, true, newRole, null, roleConfig.roleSave, null);
    }
  } catch (err) {
    next(err);
  }
};

roleController.DeleteRole = async (req, res, next) => {
  try {
    const id = req.query.id;
    const theme = await roleSch.findByIdAndUpdate(id, {
      $set: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return otherHelper.sendResponse(res, httpStatus.OK, true, theme, null, 'Role deleted successfully', null);
  } catch (err) {
    next(err);
  }
};

roleController.GetRoleSearch = async (req, res, next) => {
  const roles = await roleSch.find({
    $or: [{ role_title: { $regex: req.query.key } }],
  });
  return otherHelper.sendResponse(res, httpStatus.OK, true, roles, null, roleConfig.roleGet, null, 'Role Not Found');
};
// Role Api Code API


// Save Access ROle list  Code Start
// roleController.SaveAccessListFromRole = async (req, res, next) => {
//   try {
//     const data = req.body;
//     console.log("data", data);
  
//       if (data) {
//         const role_id = data.role_id;
//         await accessSch.findByIdAndUpdate(access.id, { $set: access }, { new: true });
//       } else {
//         access.added_by = req.user.id;
//         const newAccess = new moduleUserAccessSch(access);
//         await newAccess.save();
//       }

//       return otherHelper.sendResponse(res, httpStatus.OK, false, access, null, roleConfig.accessSave, null);
//   } catch (err) {
//     next(err);
//   }
// };


roleController.GetRolePermission = async (req, res, next) => {
  try {
    
  const role_id = req.query.id;
  if(!role_id ){
    return otherHelper.sendResponse(res, httpStatus.BAD_REQUEST, false, null, null,  "Category already exist ", null);
  }
    const  roleacess = await roleAccessModel.find({ role_id }).select("permissions module_name");
    return otherHelper.sendResponse(res, httpStatus.OK, false, roleacess, null, "Role Data Get Successfully", null);
  } catch (err) {
    console.error("Error Saving Role Access:", err);
    return next(err);
  }
};

roleController.SaveAccessListFromRole = async (req, res, next) => {
  try {
    const data = req.body;

    if (data && data.modules) {
      const savedAccesses = [];

      // Loop through each module and save it separately
      for (const moduleData of data.modules) {
        let access = await roleAccessModel.findOne({ role_id: data.role_id, module_name: moduleData.module_name });
        if (access) {
          access = await roleAccessModel.findOneAndUpdate(
            { role_id: data.role_id, module_name: moduleData.module_name },
            {
              $set: {
                permissions: moduleData.permissions,
                updated_at: new Date(),
              }
            },
            { new: true, upsert: true }
          );
        } else {
          const newAccess = new roleAccessModel({
            role_id: data.role_id,
            module_name: moduleData.module_name,
            permissions: moduleData.permissions,
            added_at: new Date(),
            added_by: req.user?.id || null, // If user authentication is available
            updated_at: new Date(),
            updated_by: req.user?.id || null,
          });

          await newAccess.save();
          access = newAccess;
        }

        savedAccesses.push(access);
      }

      return otherHelper.sendResponse( res, httpStatus.OK,  true,  savedAccesses,  null, "Role Access Saved Successfully", null );
    } else {
      return otherHelper.sendResponse( res,  httpStatus.BAD_REQUEST, false, null, "Invalid data", "Request body is empty or malformed", null  );
    }
  } catch (err) {
    console.error("Error Saving Role Access:", err);
    return next(err);
  }
};

roleController.GetAccessListFromRole = async (req, res, next) => {
  try {
    const roleId = req.query.id;
    const access = req.body;

    const users = await moduleUserAccessSch.find({ is_active: true, role_id: roleId });

    return otherHelper.sendResponse(res, httpStatus.OK, false, users, null, roleConfig.accessGet, null);
  } catch (err) { 
    next(err);
  }
};
// Save Access Role list  Code End

module.exports = roleController;
