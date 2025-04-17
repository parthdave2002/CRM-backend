const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const TaglogController = require('../../modules/taglog/taglogController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-taglog',authentication,authorization("Taglog"), TaglogController.getAllTaglogList);
router.post('/add-taglog',authentication,authorization("Taglog"), TaglogController.AddTaglog);
router.delete('/remove-taglog',authentication,authorization("Taglog"), TaglogController.DeleteTaglog);
router.delete('/status-taglog',authentication,authorization("Taglog"), TaglogController.changestatus);

router.get('/get-subtaglog', authentication, authorization("Taglog"), TaglogController.getAllSubtaglog);
router.post('/add-subtaglog', authentication, authorization("Taglog"), TaglogController.AddSubtaglog);
router.delete('/remove-subtaglog', authentication, authorization("Taglog"), TaglogController.DeleteSubtaglog);
router.delete('/update-subtaglog', authentication, authorization("Taglog"), TaglogController.updateSubtaglog);

router.post('/add-customer-taglog', authentication, authorization("Taglog"), TaglogController.AddTaglogCustomer);
router.get('/get-customer-taglogs', authentication, authorization("Taglog"), TaglogController.getAllTaglogCustomers);

module.exports = router