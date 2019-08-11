const buildRsvp = (eventName, dateString) => {
  return `Hi volunteers, the next ${eventName} will be on *${dateString}*. Please indicate your attendance below!\n\n*coming:*\n\n*not coming(reason):*`;
};

module.exports = {
    buildRsvp,
}