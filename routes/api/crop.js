const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const cropController = require('../../modules/crop/cropController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-crop',authentication,  cropController.getAllcrop);
router.post('/add-crop',authentication,  cropController.addcrop);
router.put('/update-crop',authentication,  cropController.updatecrop);
router.delete('/remove-crop',authentication,   cropController.deletecrop);

module.exports = router