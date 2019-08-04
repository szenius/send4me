class RSVPOption {
    constructor(name) {
      this.name = name;
      this.voterIds = [];
    }
  
    addVoter(voterId) {
      this.voterIds.push(voterId);
    }
  };

  module.exports = RSVPOption;