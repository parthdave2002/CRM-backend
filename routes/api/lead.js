const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const leadController = require('../../modules/lead/leadController');

router.get('/getlead', leadController.getAlllead);
router.post('/addlead', leadController.addlead);

router.put('/updatelead', leadController.updatelead);
router.delete('/deletelead', leadController.deletelead);


module.exports = router