class Message {
  constructor(id, text, sendDate, closeDate) {
    this.id = id;
    this.text = text;
    this.sendDate = sendDate;
    this.closeDate = closeDate;
  }

  setText = text => (this.text = text);
  getId = () => this.id;
  getText = () => this.text;
  getSendDate = () => this.sendDate;
  getCloseDate = () => this.closeDate;
}
