const remove = require("lodash/remove");

class Schedule {
  constructor() {
    this.scheduledMessages = [];
    this.sentMessages = [];
  }

  scheduleNewMessage = message => this.scheduledMessages.push(message);

  markMessageSent = messageId => {
    const sentMessage = remove(this.scheduledMessages, message => message.id === messageId);
    this.sentMessages.push(sentMessage);
  };

  getNextMessageToSend = () => {
      const now = new Date();
      return this.scheduledMessages.find(message => isSameDate(message.sendDate, now));
  }

  getScheduledMessages = () => this.scheduledMessages;
  getSentMessages = () => this.sentMessages;

  // TODO: refactor
  isSameDate = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear() &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    );
  };  
}
