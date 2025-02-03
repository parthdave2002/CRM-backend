const express = require('express');
const { authentication, authorization } = require('../../middleware/auth.middleware');
const router = express.Router();
const packingController = require('../../modules/adminProduct/adminPackingController');

router.get("/get-packing", packingController.getAllPackingList)
router.post("/add-packing", packingController.AddPacking)
router.delete("/remove-packing", packingController.DeletePacking)

module.exports = router