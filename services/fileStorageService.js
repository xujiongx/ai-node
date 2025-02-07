const fs = require('fs').promises;
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../data');

class FileStorageService {
  constructor() {
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }

  async saveConversation(sessionId, messages) {
    const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
    await fs.writeFile(filePath, JSON.stringify(messages, null, 2));
  }

  async getConversation(sessionId) {
    const filePath = path.join(STORAGE_DIR, `${sessionId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async getConversationList() {
    try {
      const files = await fs.readdir(STORAGE_DIR);
      const conversations = await Promise.all(
        files
          .filter((file) => file.endsWith('.json'))
          .map(async (file) => {
            const sessionId = file.replace('.json', '');
            try {
              const data = await fs.readFile(
                path.join(STORAGE_DIR, file),
                'utf8'
              );
              const messages = JSON.parse(data);
              const firstMessage = messages.find((msg) => msg.role === 'user');
              return {
                id: sessionId,
                title: firstMessage ? firstMessage.content : '新对话',
              };
            } catch (error) {
              return {
                id: sessionId,
                title: '无法读取对话',
              };
            }
          })
      );
      
      // 按 ID（时间戳）降序排序
      return conversations.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    } catch (error) {
      return [];
    }
  }
}

module.exports = new FileStorageService();
