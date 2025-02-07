const express = require('express');
const router = express.Router();
const uploadHelper = require("../../helper/upload.helper")
const TaglogController = require('../../modules/taglog/taglogController');

router.get('/get-taglog', TaglogController.getAllTaglogList);
router.post('/add-taglog', TaglogController.AddTaglog);
router.delete('/remove-taglog', TaglogController.DeleteTaglog);

 module.exports = router