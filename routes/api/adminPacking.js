const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const packingController = require('../../modules/adminProduct/adminPackingController');

router.get("/get-packing", authentication, packingController.getAllPackingList)
router.post("/add-packing",authentication, packingController.AddPacking)
router.delete("/remove-packing",authentication, packingController.DeletePacking)

module.exports = router