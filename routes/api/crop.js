const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const cropController = require('../../modules/crop/cropController');

router.get('/get-crop', cropController.getAllcrop);
router.post('/add-crop', cropController.addcrop);
router.put('/update-crop', cropController.updatecrop);
router.delete('/remove-crop', cropController.deletecrop);

module.exports = router