const express = require('express');
const router = express.Router();
const { getDemoMessage } = require('../controllers/demoController');

router.get('/', getDemoMessage);

module.exports = router;