const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  
  // 这里简单演示，实际应用中应该验证用户名密码
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      code: 0,
      data: {
        token,
        username
      }
    });
  } else {
    res.status(401).json({
      code: -1,
      error: '用户名或密码错误'
    });
  }
};