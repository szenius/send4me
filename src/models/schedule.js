const remove = require("lodash/remove");
const moment = require('moment');

class Schedule {
  constructor() {
    this.scheduledMessages = [];
    this.sentMessages = [];
  }

  scheduleNewMessage(message) {
    this.scheduledMessages.push(message);
  }

  markMessageSent(messageId) {
    const sentMessage = remove(
      this.scheduledMessages,
      message => message.id === messageId
    );
    this.sentMessages.push(sentMessage);
  }

  getNextMessageToSend() {
    const now = new Date();
    return this.scheduledMessages.find(message =>
      moment(message.sendDate).isSame(now, 'minute')
    );
  }

  getScheduledMessages() {
    return this.scheduledMessages;
  }
  getSentMessages() {
    return this.sentMessages;
  }
}

module.exports = {
  Schedule
};
