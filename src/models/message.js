class Message {
  constructor(text, sendDate, closeDate) {
    this.text = text;
    this.sendDate = sendDate;
    this.closeDate = closeDate;
  }

  setId(id) {
    this.id = id;
  }

  setText(text) {
    this.text = text;
  }

  getId() {
    return this.id;
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
}

module.exports = {
  Message
};
