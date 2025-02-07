const express = require('express');
const router = express.Router();
const mistralController = require('../controllers/mistralController');

// 现有的对话接口
router.get('/', mistralController.getMistralMessage);

// 新增的历史记录接口
router.get('/conversations', mistralController.getConversationList);
router.get(
  '/conversations/:sessionId',
  mistralController.getConversationHistory
);

module.exports = router;
