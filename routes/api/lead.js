const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const leadController = require('../../modules/lead/leadController');

router.get('/get-lead', leadController.getAlllead);
router.post('/add-lead', leadController.addlead);

router.put('/update-lead', leadController.updatelead);
router.delete('/delete-lead', leadController.deletelead);


module.exports = router