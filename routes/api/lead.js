const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const leadController = require('../../modules/lead/leadController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-lead',authentication, leadController.getAlllead);
router.post('/add-lead',authentication, leadController.addlead);
router.put('/update-lead',authentication, leadController.updatelead);
router.delete('/delete-lead',authentication, leadController.deletelead);


module.exports = router