const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const TaglogController = require('../../modules/taglog/taglogController');
const { authentication } = require('../../middleware/auth.middleware');

router.get('/get-taglog',authentication, TaglogController.getAllTaglogList);
router.post('/add-taglog',authentication, TaglogController.AddTaglog);
router.delete('/remove-taglog',authentication, TaglogController.DeleteTaglog);

 module.exports = router