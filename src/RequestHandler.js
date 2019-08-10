const markComing = userId => {
  // TODO: save to database & add to original RSVP message
  console.log(`${userId} is coming`);
};

const markNotComing = (userId, reason) => {
  // TODO: save to database & add to original RSVP message
  console.log(`${userId} is not coming because ${reason}`);
};

module.exports = {
  markComing,
  markNotComing
};
