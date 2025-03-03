const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const leadController = require('../../modules/lead/leadController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-lead',authentication,authorization("Lead"), leadController.getAlllead);
router.post('/add-lead',authentication,authorization("Lead"), leadController.addlead);
router.put('/update-lead',authentication,authorization("Lead"), leadController.updatelead);
router.delete('/delete-lead',authentication,authorization("Lead"), leadController.deletelead);


module.exports = router