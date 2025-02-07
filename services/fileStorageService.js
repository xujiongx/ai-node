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
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''))
        .map((name) => ({
          id: name,
          title: name,
        }));
    } catch (error) {
      return [];
    }
  }
}

module.exports = new FileStorageService();
