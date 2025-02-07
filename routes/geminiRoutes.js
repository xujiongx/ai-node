const express = require('express');
const router = express.Router();
const { getGeminiMessage } = require('../controllers/geminiController');

router.get('/', getGeminiMessage);

module.exports = router;