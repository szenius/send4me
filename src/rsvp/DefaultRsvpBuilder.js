const buildRsvp = (eventName, dateString) => {
  return `Hi volunteers, the next ${eventName} will be on ${dateString}. Please indicate your attendance below!\n\ncoming:\n\nnot coming(reason):`;
};

module.exports = {
  buildRsvp
};
