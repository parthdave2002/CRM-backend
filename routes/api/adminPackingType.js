const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const packingTypeController = require('../../modules/adminProduct/adminPackingTypeController');

router.get("/",authentication,authorization("Packing Type"), packingTypeController.getAllPackingTypeList)
router.post("/add-packing-type",authentication,authorization("Packing Type"), packingTypeController.AddPackingType)
router.delete("/remove-packing-type",authentication,authorization("Packing Type"), packingTypeController.DeletePackingType)

module.exports = router