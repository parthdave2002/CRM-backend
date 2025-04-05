const express = require('express');
const router = express.Router();
const complainController = require('../../modules/complain/complainController.js');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-complain',authentication,  complainController.getAllcomplain);
router.post('/add-complain',authentication,  complainController.addcomplain);
router.put('/update-complain',authentication,  complainController.updatecomplain);
router.delete('/remove-complain',authentication,   complainController.deletecomplain);
router.get('/getbyid',authentication,   complainController.getbyid);


module.exports = router