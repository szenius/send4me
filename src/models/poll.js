class Poll extends Message {
  constructor(id, text, sendDate, closeDate, options) {
    super(id, text, sendDate, closeDate);
    this.responses = new Map();
    options.map(option => this.responses.set(option, []));
  }

  addResponse = (option, user) => this.responses.get(option).push(user);
  getResponseForOption = option => this.responses.get(option);
  getAllResponses = () => this.responses;
}
