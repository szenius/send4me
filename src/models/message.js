class Message {
  constructor(text, sendDate, closeDate, chatId) {
    this.text = text;
    this.sendDate = sendDate;
    this.closeDate = closeDate;
    this.chatId = chatId;
    this.isPoll = false;
    this.isSent = false;
    this.isClosed = false;
  }

  setMessageId(messageId) {
    this.messageId = messageId;
  }

  setText(text) {
    this.text = text;
  }

  setIsClosed(isClosed) {
    this.isClosed = isClosed;
  }

  setIsSent(isSent) {
    this.isSent = isSent;
  }

  getMessageId() {
    return this.messageId;
  }

  getText() {
    return this.text;
  }

  getSendDate() {
    return this.sendDate;
  }

  getCloseDate() {
    return this.closeDate;
  }

  getChatId() {
    return this.chatId;
  }

  getIsClosed() {
    return this.isClosed;
  }

  getIsSent() {
    return this.isSent;
  }

  getIsPoll() {
    return this.isPoll;
  }
}

module.exports = {
  Message
};
