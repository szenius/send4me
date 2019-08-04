const RSVPOption = require('./rsvp_option.js');

class RSVP {
  constructor() {
    this.description = null;
    this.options = [];
  }

  addDescription(description) {
    this.description = description;
  }

  addOption(name) {
    this.options.push(new RSVPOption(name));
  }

  toString() {
      let rsvpString = this.description + '\n';
      for (const option of this.options) {
          rsvpString += option.name + '\n';
      }
      return rsvpString;
  }
};

module.exports = RSVP;