const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const packingTypeController = require('../../modules/adminProduct/adminPackingTypeController');

router.get("/",authentication, packingTypeController.getAllPackingTypeList)
router.post("/add-packing-type",authentication, packingTypeController.AddPackingType)
router.delete("/remove-packing-type",authentication, packingTypeController.DeletePackingType)

module.exports = router