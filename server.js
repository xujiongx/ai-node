const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const demoRoutes = require('./routes/demoRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const mistralRoutes = require('./routes/mistralRoutes');


// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试路由
app.get('/', (req, res) => {
  res.json({ code: 0, data: 'Welcome to the API' });
});

// Demo 路由
app.use('/demo', demoRoutes);
app.use('/gemini', geminiRoutes);

// 中间件配置后添加
app.use('/mistral', mistralRoutes);

// 设置端口
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
