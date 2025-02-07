const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: 'sk-c680426047524cf9ad02ac2c1d458a89',
});

async function getDeepSeekApiData() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
    model: 'deepseek-chat',
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}

const getDemoMessage = async (req, res) => {
  try {
    const data = await getDeepSeekApiData();
    res.json({ message: data });
  } catch (error) {
    // 处理 402 错误
    if (error.status === 402) {
      return res.status(402).json({
        error: '接口调用失败：可能是 API 额度已用完或账户支付问题',
        details: error.message
      });
    }
    // 处理其他错误
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
};

module.exports = {
  getDemoMessage,
};
