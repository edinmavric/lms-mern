const express = require('express');
const router = express.Router();
const { getUploadUrl } = require('../controllers/uploadController');

router.get('/signed-url', getUploadUrl);

module.exports = router;
