const express = require('express');
const router = express.Router();
const leadController = require('../../modules/lead/leadController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-lead', authentication, authorization('Lead'), leadController.getAlllead);
router.post('/add-lead',  leadController.addlead);
router.get('/mark-lead',  leadController.changeStatus);


module.exports = router