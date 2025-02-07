const { Mistral } = require('@mistralai/mistralai');
require('dotenv').config();
const fileStorage = require('../services/fileStorageService');

const client = new Mistral(process.env.MISTRAL_API_KEY);

async function getMistralResponse(params) {
  const { content, sessionId } = params;

  // 从文件存储获取会话历史
  let messages = await fileStorage.getConversation(sessionId);

  // 添加用户新消息
  const userMessage = { role: 'user', content };
  messages.push(userMessage);

  try {
    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      stream: false,
      messages: messages,
    });

    // 保存助手的回复
    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    // 如果历史记录太长，可以适当裁剪
    if (messages.length > 20) {
      messages = messages.slice(-20);
    }

    // 保存到文件
    await fileStorage.saveConversation(sessionId, messages);

    return assistantMessage.content;
  } catch (error) {
    console.error('Mistral API Error:', error);
    throw error;
  }
}

// 获取历史对话列表
const getConversationList = async (req, res) => {
  try {
    const conversations = await fileStorage.getConversationList();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getConversationHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await fileStorage.getConversation(sessionId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMistralMessage = async (req, res) => {
  try {
    const { content, sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: '缺少 sessionId 参数',
      });
    }

    const data = await getMistralResponse({ content, sessionId });
    res.json({ code: 0, data });
  } catch (error) {
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message,
    });
  }
};

module.exports = {
  getMistralMessage,
  getConversationList,
  getConversationHistory,
};
