class InMemoryCache {
  constructor() {
    this.cache = {};
  }

  get(chatId) {
    return this.cache[chatId];
  }

  set(chatId, targetChatId) {
    this.cache[chatId] = targetChatId;
  }

  remove(chatId) {
    delete this.cache[chatId];
  }
}

let cache = new InMemoryCache();

const getInMemoryCache = () => {
  return cache;
};

module.exports = {
  getInMemoryCache,
};
