const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const cropController = require('../../modules/crop/cropController');

router.get('/getcrop', cropController.getAllcrop);
router.post('/addcrop', cropController.addcrop);

router.put('/updatecrop', cropController.updatecrop);
router.delete('/deletecrop', cropController.deletecrop);


module.exports = router