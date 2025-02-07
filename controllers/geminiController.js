const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function getAIResponse() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'You are a helpful assistant.' }]}],
    });

    const response = await result.response;
    console.log(response.text());
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

const getGeminiMessage = async (req, res) => {
  try {
    const data = await getAIResponse();
    res.json({ message: data });
  } catch (error) {
    res.status(500).json({
      error: '服务器内部错误',
      details: error.message
    });
  }
};

module.exports = {
  getGeminiMessage,
};