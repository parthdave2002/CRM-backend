const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const packingTypeController = require('../../modules/adminProduct/adminPackingTypeController');

router.get("/", packingTypeController.getAllPackingTypeList)
router.post("/add-packing-type", packingTypeController.AddPackingType)
router.delete("/remove-packing-type", packingTypeController.DeletePackingType)

module.exports = router