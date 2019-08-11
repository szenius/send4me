const markComing = userId => {
  // TODO: save to database & add to original RSVP message
  console.log(`${userId} is coming`);
};

const markNotComing = (userId) => {
  // TODO: save to database & add to original RSVP message
  console.log(`${userId} is not coming`);
};

module.exports = {
  markComing,
  markNotComing
};
