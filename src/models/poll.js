const { Message } = require("./message");

class Poll extends Message {
  constructor(text, sendDate, closeDate, options) {
    super(text, sendDate, closeDate);
    this.responses = new Map();
    options.map(option => this.responses.set(option, []));
    this.isDisabled = false;
  }

  addResponse(option, user) {
    if (!this.isDisabled) {
      this.responses.get(option).push(user);
    }
  }

  setIsDisabled(isDisabled) {
    this.isDisabled = isDisabled;
  }

  getText() {
    let text = `${this.text}\n\n`;
    for (let [option, users] of this.responses) {
      text += `${option}\n`;
      text += `${Array.join(users.map(user => user.username), ', ')}\n\n`;
    }
    return text.trim();
  }

  getResponseForOption(option) {
    return this.responses.get(option);
  }

  getAllResponses() {
    return this.responses;
  }

  getIsDisabled() {
    return this.isDisabled;
  }
}

module.exports = {
  Poll
};
