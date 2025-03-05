const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const cropController = require('../../modules/crop/cropController');
const { authentication,  authorization } = require('../../middleware/auth.middleware');

router.get('/get-crop',authentication, authorization("Crop"), cropController.getAllcrop);
router.post('/add-crop',authentication, authorization("Crop"), cropController.addcrop);
router.put('/update-crop',authentication, authorization("Crop"), cropController.updatecrop);
router.delete('/remove-crop',authentication, authorization("Crop"),  cropController.deletecrop);
router.delete('/status-crop',authentication, authorization("Crop"),  cropController.changestatus);

module.exports = router