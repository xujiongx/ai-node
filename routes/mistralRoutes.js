const express = require('express');
const router = express.Router();
const mistralController = require('../controllers/mistralController');

// 现有的对话接口
router.get('/', mistralController.getMistralMessage);

// 新增的历史记录接口
router.get('/conversations', mistralController.getConversationList);
router.get('/conversations/:sessionId', mistralController.getConversationHistory);

// 获取最近对话ID的接口
router.get('/latest', mistralController.getLatestConversation);

// 添加对联生成接口
router.get('/couplet/generate', mistralController.generateCouplet);

// 添加翻译接口
router.get('/translate', mistralController.translate);

module.exports = router;
