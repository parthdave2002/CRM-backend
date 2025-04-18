const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const TaglogController = require('../../modules/taglog/taglogController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-taglog',authentication, TaglogController.getAllTaglogList);
router.post('/add-taglog',authentication, TaglogController.AddTaglog);
router.delete('/remove-taglog',authentication, TaglogController.DeleteTaglog);
router.delete('/status-taglog',authentication, TaglogController.changestatus);

router.get('/get-subtaglog', authentication,  TaglogController.getAllSubtaglog);
router.post('/add-subtaglog', authentication,  TaglogController.AddSubtaglog);
router.delete('/remove-subtaglog', authentication,  TaglogController.DeleteSubtaglog);
router.delete('/update-subtaglog', authentication,  TaglogController.updateSubtaglog);

router.post('/add-customer-taglog', authentication, TaglogController.AddTaglogCustomer);
router.get('/get-customer-taglog', authentication,  TaglogController.getAllTaglogCustomers);

module.exports = router