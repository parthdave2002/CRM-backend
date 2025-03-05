const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const TaglogController = require('../../modules/taglog/taglogController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-taglog',authentication,authorization("Taglog"), TaglogController.getAllTaglogList);
router.post('/add-taglog',authentication,authorization("Taglog"), TaglogController.AddTaglog);
router.delete('/remove-taglog',authentication,authorization("Taglog"), TaglogController.DeleteTaglog);
router.delete('/status-taglog',authentication,authorization("Taglog"), TaglogController.changestatus);

 module.exports = router