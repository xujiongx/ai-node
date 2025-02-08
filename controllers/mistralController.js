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
    res.json({ code: 0, data: history });
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

const generateCouplet = async (req, res) => {
  try {
    const { content } = req.query;
    if (!content) {
      return res.status(400).json({
        error: '请提供对联主题或关键词',
      });
    }

    const prompt = `你是一个专业的对联大师。请根据主题"${content}"创作一副优美的对联。要求：
1. 上下联字数相同，平仄工整
2. 上下联要意境优美，意象丰富
3. 横批要与对联主题呼应，简洁有力
4. 整体要富有文学气息和传统韵味
5. 严格按照以下JSON格式返回：{"up":"上联内容","down":"下联内容","horizontal":"横批内容"}
请直接返回JSON数据，不要有任何其他内容。`;

    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      stream: false,
      messages: [
        {
          role: 'system',
          content: '你是一位精通对联创作的文学大师，擅长创作优美、工整、意境深远的对联。'
        },
        { role: 'user', content: prompt }
      ],
    });

    try {
      // 清理返回的内容，移除可能的 markdown 标记
      const cleanContent = response.choices[0].message.content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      const result = JSON.parse(cleanContent);
      res.json({ code: 0, data: result });
    } catch (error) {
      res.status(500).json({
        error: '生成对联格式错误',
        details: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message,
    });
  }
};

const getLatestConversation = async (req, res) => {
  try {
    const conversations = await fileStorage.getConversationList();
    if (conversations && conversations.length > 0) {
      // 按时间戳排序（从大到小）
      const sortedConversations = conversations.sort((a, b) => {
        return parseInt(b.id) - parseInt(a.id);
      });
      res.json({ code: 0, data: sortedConversations[0].id });
    } else {
      res.json({ code: 0, data: null });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const translate = async (req, res) => {
  try {
    const { content, from = 'auto', to = 'zh' } = req.query;
    
    if (!content) {
      return res.status(400).json({
        error: '请提供需要翻译的内容',
      });
    }

    const prompt = `请将以下文本从${from}翻译成${to}，直接返回翻译结果，不要有任何解释或额外内容：\n\n${content}`;

    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      stream: false,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的翻译器，只返回翻译结果，不做任何解释。'
        },
        { role: 'user', content: prompt }
      ],
    });
console.log('🤪', response.choices[0].message.content);
    res.json({ 
      code: 0, 
      data: {
        result: response.choices[0].message.content.trim(),
        from,
        to
      }
    });
  } catch (error) {
    res.status(500).json({
      error: '翻译失败',
      details: error.message,
    });
  }
};

module.exports = {
  getMistralMessage,
  getConversationList,
  getConversationHistory,
  getLatestConversation,
  generateCouplet,
  translate,  // 添加新方法到导出
};
